import { Component, OnInit, OnDestroy, ViewChild, ElementRef  } from '@angular/core';
import { Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray, AbstractControl, FormBuilder, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatChipList, MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UsersService } from '../services/users.service';
import { TwitterPerson, TwitterAccount } from '../objects/objects';
import { removeFirst } from '../utils/utils';

@Component({
    selector: 'twitter-form',
    templateUrl: './twit-form.component.html',
    styleUrls: ['/twit-form.component.scss']
})
export class TwitterFormComponent implements OnInit, OnDestroy {

    account: TwitterAccount = <TwitterAccount>{
        id: -1,
        name: '',
        api_key: '',
        api_secret: '',
        api_key_stars: '',
        api_secret_stars: '',
        token: '',
        access_token: '',
        access_token_secret: '',
        is_active: false
    };
    form: FormGroup;
    isReady: boolean = false;
    canAdd: boolean = false;
    success: boolean = false;
    isSending: boolean = false;
    isSendingTP: boolean = false;
    showForm: boolean = false;
    error: any = null;
    persons: TwitterPerson[] = [];
    personsControl = new FormControl();

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('personInput') personInput: ElementRef<HTMLInputElement>;

    private _getAccSub$: Subscription | null = null;
    private _accSub$: Subscription | null = null;
    private _perSub$: Subscription | null = null;
    private _formSub$: Subscription | null = null;
    private _personsSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private snackBar: MatSnackBar,
                private fb: FormBuilder) {}

    /*removePerson(ki: TwitterPerson) {
        const kilist = this.keyImagesControl.value as KeyImage[];
        removeFirst(kilist, ki);
        this.keyImagesControl.markAsTouched();
        this.keyImagesControl.setValue(kilist.slice());
    }*/

    // custom validation errors
    private _handleErrors(e: any) {
        try {
          for (let field in e) {
              //console.log('err', field, 'field:', e[field]);
              this.form.controls[field].setErrors(e[field][0]); // take only last one
          }
        } catch(er) {
            this.error = 'Error!';
        }
    }

    getErrorMessage(fieldName: string): ValidationErrors | string | null {
        if (this.form.controls[fieldName].hasError('already_in_use')) {
            return 'This ' + fieldName + ' is already in use';
        } else if (this.form.controls[fieldName].hasError('required')) {
            return 'You must enter a value';
        } else if (this.form.controls[fieldName].errors) {
            console.log('getErrorMessage', this.form.controls[fieldName].errors);
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    send() {
        if (this.form.invalid) return;

        this._saveBackup(); // this.account updated

        this.isSending = true;
        this.usersService.botState = 'cooling';
        if (this._accSub$) this._accSub$.unsubscribe();
        if(this.account.id > 0) {
            this.update();
        } else {
            this.create();
        }
    }

    create() {
        this._accSub$ = this.usersService.createTwitterAccount(this.account).subscribe(
            (res: TwitterAccount) => {
                this.account.id = res.id;
                this.account.api_key_stars = res.api_key_stars;
                this.account.api_secret_stars = res.api_secret_stars;
                this.isSending = false;
                this.error = null;
                this.showForm = false;
                this.usersService.botState = 'ready';
            },
            err => {
                this.isSending = false;
                this.error = null;
                this.usersService.botState = 'ready';
                this._handleErrors(err.error);
            }
        );
    }

    update() {
        this._accSub$ = this.usersService.updateTwitterAccount(this.account).subscribe(
            (res: TwitterAccount) => {
                this.account.api_key_stars = res.api_key_stars;
                this.account.api_secret_stars = res.api_secret_stars;
                this.isSending = false;
                this.error = null;
                this.showForm = false;
                this.usersService.botState = 'ready';
            },
            err => {
                this.isSending = false;
                this.error = null;
                this.usersService.botState = 'ready';
            }
        );
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 3000 });
    }


    toggleForm() {
        this.showForm = !this.showForm;
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        if (value) {
          let newPerson = <TwitterPerson>{
              id: -1,
              name: value
          };
          this.isSendingTP = true;
          this.usersService.botState = 'cooling';
          if (this._personsSub$) this._personsSub$.unsubscribe();
          this._personsSub$ = this.usersService.createTwitterPerson(newPerson).subscribe(
              res => {
                  this.persons.push(res);
                  this.usersService.botState = 'ready';
                  this.isSendingTP = false;
              },
              err => {
                this.isSendingTP = false;
                this.usersService.botState = 'ready';
                if (err.error['non_field_errors']) {
                    this.openSnackBar(err.error['non_field_errors'][0], 'Закрыть');
                } else {
                    this.openSnackBar('Ошибка обработки аккаунта', 'Закрыть');
                }
              }
          );
        }

        event.chipInput!.clear();
        this.personsControl.setValue('');
    }

    remove(person: TwitterPerson): void {
        const index = this.persons.findIndex(item => { return person.id === item.id });
        this.isSendingTP = true;
        if (index >= 0) {
            if (this._personsSub$) this._personsSub$.unsubscribe();
            this.usersService.botState = 'cooling';
            this._personsSub$ = this.usersService.deleteTwitterPerson(person).subscribe(
                () => {
                    this.persons.splice(index, 1);
                    this.usersService.botState = 'ready';
                    this.isSendingTP = false;
                },
                err => {
                    this.openSnackBar('Ошибка при удалении аккаунта', 'Закрыть');
                    this.usersService.botState = 'ready';
                    this.isSendingTP = false;
                }
            );
        }
    }

    // utils
    compareFn(v1: TwitterPerson | null, v2: TwitterPerson | null): boolean {
        if (!v1 || !v2) return false;
        return v1.id === v2.id;
    }

    private _saveBackup() {
        this.account = Object.assign(this.account, this.form.value);
    }

    initForm() {
        this.form = this.fb.group({
            api_key: this.fb.control(this.account.api_key, [Validators.required]),
            api_secret: this.fb.control(this.account.api_secret, [Validators.required]),
            token: this.fb.control(this.account.token, [Validators.required]),
            access_token: this.fb.control(this.account.access_token, [Validators.required]),
            access_token_secret: this.fb.control(this.account.access_token_secret, [Validators.required])
        });

        if (this._formSub$) this._formSub$.unsubscribe();
        this._formSub$ = this.form.valueChanges.subscribe(
            value => {
                //console.log('form value changed', this.form);
                this._saveBackup();
            }
        );
    }

    getPersons() {
        this._perSub$ = this.usersService.getTwitterPersons().subscribe(
            (res: TwitterPerson[]) => {
                this.persons = res;
                this.canAdd = true;
                this.isReady = true;
                this.initForm();
            },
            err => {}
        );
    }

    ngOnInit() {
      this._getAccSub$ = this.usersService.getTwitterAccounts().subscribe(
          (res: TwitterAccount[]) => {
              if (res.length > 0) {
                  this.account = res[0];
                  this.getPersons();
              } else {
                  this.isReady = true;
                  this.initForm();
              }
          },
          err => {
              this.openSnackBar('Ошибка загрузки твиттер аккаунта', 'Закрыть');
          }
      );
    }

    ngOnDestroy() {
        if (this._getAccSub$) this._getAccSub$.unsubscribe();
        if (this._accSub$) this._accSub$.unsubscribe();
        if (this._perSub$) this._perSub$.unsubscribe();
        if (this._formSub$) this._formSub$.unsubscribe();
        if (this._personsSub$) this._personsSub$.unsubscribe();
    }
}
