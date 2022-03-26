import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../../objects/objects'
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'forgot-page',
    templateUrl: './forgot.page.html',
    styleUrls: ['/login.page.scss']
})
export class ForgotPage implements OnInit, OnDestroy {
    form: FormGroup;
    error: any;
    isSending: boolean = false;
    success: boolean = false;
    isReady: boolean = false;

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
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    send() {
        if (this.form.invalid) return;

        this.isSending = true;
        this.error = null;
        this.success = false;

        if (this._sendSub$) this._sendSub$.unsubscribe();
        this._sendSub$ = this.authService.forgotEmail(this.form.controls.email.value)
            .subscribe(
                response => {
                    this.isSending = false;
                    this.success = true;
                },
                error => {
                    this.isSending = false;
                    this.success = false;
                    try {
                        if (!error['error']) {
                            this.error = { error: 'Not connected!' };
                        } else if (error.error['detail']) {
                            this.error = error.error.detail;
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

    initForm() {
        this.form = this.fb.group({
            email: this.fb.control('', [Validators.required, Validators.email])
        });

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
        if (this._sendSub$) this._sendSub$.unsubscribe();
    }
}
