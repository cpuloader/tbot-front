import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EmailData } from '../objects/objects';
import { UsersService } from '../services/users.service';

@Component({
    selector: 'emailsmtpdata',
    templateUrl: './emaildata.component.html',
    styleUrls: ['/emaildata.component.scss']
})
export class EmailDataComponent implements OnInit, OnDestroy {
    data: EmailData = <EmailData>{
        host: '',
        email: '',
        password: '',
        port: null
    };
    form: FormGroup;
    error: any;
    isSending: boolean = false;
    isReady: boolean = false;

    private _formSub$: Subscription | null = null;
    private _sendSub$: Subscription | null = null;

    constructor(public router: Router,
                private fb: FormBuilder,
                private usersService: UsersService) {}

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
        } else if (this.form.controls[fieldName].errors) {
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    send() {
        if (this.form.invalid) return;
        this._saveBackup(); // this.data updated

        this.isSending = true;
        this.error = null;
        if (this._sendSub$) this._sendSub$.unsubscribe();

        this._sendSub$ = this.usersService.createEmailData(this.data)
            .subscribe(
                (response: EmailData) => {
                    this.isSending = false;
                },
                (error: any) => {
                    this.isSending = false;
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

    private _saveBackup() {
        this.data = Object.assign(this.data, this.form.value);
    }

    initForm() {
        this.form = this.fb.group({
            host: this.fb.control(this.data.host, [Validators.required]),
            email: this.fb.control(this.data.email, [Validators.required, Validators.email]),
            password: this.fb.control(this.data.password, [Validators.required]),
            port: this.fb.control(this.data.port, [Validators.required])
        });

        if (this._formSub$) this._formSub$.unsubscribe();
        this._formSub$ = this.form.valueChanges.subscribe(
            value => { this._saveBackup(); }
        );

        this.isReady = true;
    }

    getEmailData() {
      this._sendSub$ = this.usersService.getEmailData().subscribe(
          (res: EmailData) => {
              if (res) this.data = res;
              this.initForm();
          },
          (err: any) => {
              console.log(err);
          }
      );
    }

    ngOnInit() {
        this.getEmailData();
    }

    ngOnDestroy() {
        if (this._formSub$) this._formSub$.unsubscribe();
        if (this._sendSub$) this._sendSub$.unsubscribe();
    }
}
