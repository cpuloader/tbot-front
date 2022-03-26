import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../../objects/objects'
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'login-page',
    templateUrl: './login.page.html',
    styleUrls: ['/login.page.scss']
})
export class LoginPage implements OnInit, OnDestroy {
    user: User = <User>{
        id: -1,
        email: '',
        username: '',
        password: '',
        tagline: '',
        is_online: false,
        bot_is_active: false
    };
    form: FormGroup;
    error: any;
    isSending: boolean = false;
    isReady: boolean = false;

    private _formSub$: Subscription | null = null;
    private _sendSub$: Subscription | null = null;

    constructor(public router: Router,
                private fb: FormBuilder,
                private authService: AuthService) {}

    // custom validation errors
    private _handleErrors(e: any) {
        try {
          for (let field in e) {
              this.form.controls[field].setErrors(e[field][0]);
          }
        } catch(er) {
            this.error = 'Error!';
        }
    }

    getErrorMessage(fieldName: string): ValidationErrors | string | null {
        if (this.form.controls[fieldName].hasError('required')) {
            return 'Не может быть пустым';
        } else if (this.form.controls[fieldName].hasError('email')) {
            return 'Недопустимый email';
        } else if (this.form.controls[fieldName].errors) {
            //console.log(this.form.controls[fieldName].errors);
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    login() {
        if (this.form.invalid) return;
        this._saveBackup(); // this.user updated

        this.isSending = true;
        this.error = null;
        if (this._sendSub$) this._sendSub$.unsubscribe();

        this._sendSub$ = this.authService.login(this.user.email, this.user.password)
            .subscribe(
                response => {
                    this.isSending = false;
                },
                error => {
                    this.isSending = false;
                    try {
                        if (!error['error']) {
                            this.error = { error: 'Not connected!' };
                        } else if (error.error['detail']) {
                            console.log('error.error.detail', error.error.detail);
                            if (error.error.detail.indexOf('combination invalid') > -1) {
                                this.error = 'Неправильный email или пароль.';
                            } else {
                                this.error = error.error.detail;
                            }
                        } else {
                            this.error = 'Ошибка!';
                        }
                    }
                    catch(err) {
                        this.error = 'Ошибка!';
                    }
                }
            );
    }

    private _saveBackup() {
        this.user = Object.assign(this.user, this.form.value);
    }

    initForm() {
        this.form = this.fb.group({
            email: this.fb.control(this.user.email, [Validators.required, Validators.email]),
            password: this.fb.control(this.user.password, [Validators.required])
        });

        if (this._formSub$) this._formSub$.unsubscribe();
        this._formSub$ = this.form.valueChanges.subscribe(
            value => { this._saveBackup(); }
        );

        this.isReady = true;
    }

    ngOnInit() {
        if (this.authService.isAuthorized()) {
            this.router.navigate(['/home']);
        } else {
            this.initForm();
        }
    }

    ngOnDestroy() {
        if (this._formSub$) this._formSub$.unsubscribe();
        if (this._sendSub$) this._sendSub$.unsubscribe();
    }
}
