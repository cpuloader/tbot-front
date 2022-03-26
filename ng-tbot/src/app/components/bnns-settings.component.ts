import { Component, ViewChild, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { User, BinanceAccount, BinanceAccountAsset } from '../objects/objects';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { DialogConfirmComponent } from './dialog-confirm.component';

const ACC_STATE_INITIAL: number = 0;
const ACC_STATE_GOOD: number = 1;
const ACC_STATE_BAD: number = 2;
const ACC_ICON_INITIAL: string = 'refresh';
const ACC_ICON_GOOD: string = 'done';
const ACC_ICON_BAD: string = 'clear';
const ACC_COLOR_INITIAL: string = '#fff';
const ACC_COLOR_GOOD: string = '#0bc428'; // green
const ACC_COLOR_BAD: string = '#f44336'; // red

@Component({
    selector: 'bnns-settings-component',
    templateUrl: './bnns-settings.component.html',
    styleUrls: ['/bnns-settings.component.scss']
})
export class BnnsSettingsComponent implements OnInit, OnDestroy {
    form: FormGroup;
    apisReceived: boolean = false;
    isSending: boolean = false;
    isDeleting: boolean = false;
    formOpened: boolean = false;
    isTesting: boolean = false;
    isSwitching: boolean = false;
    error: any = null;
    acc: BinanceAccount = new BinanceAccount();
    accs: BinanceAccount[] = [];
    assetsColumns: string[] = ['currency', 'balance'];

    dialog: MatDialogRef<any> | null = null;

    private _bnnsSub$: Subscription | null = null;
    private _crAccSub$: Subscription | null = null;
    private _dltAccSub$: Subscription | null = null;
    private _tstAccSub$: Subscription | null = null;
    private _tglAccSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private authService: AuthService,
                private fb: FormBuilder,
                private vcr: ViewContainerRef,
                private mdDialog: MatDialog,
                private snackBar: MatSnackBar
                ) {
    }

    get nameControl(): FormControl {
        return this.form.controls.name as FormControl;
    }

    get apiKeyControl(): FormControl {
        return this.form.controls.bnns_key as FormControl;
    }

    get apiSecretControl(): FormControl {
        return this.form.controls.bnns_secret as FormControl;
    }

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
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    send() {
        if (this.form.invalid) return;
        if (this.isSending) return;
        this.acc = Object.assign(this.acc, this.form.value);
        this.isSending = true;
        this.usersService.botState = 'cooling';
        if (this._crAccSub$) this._crAccSub$.unsubscribe();
        this._crAccSub$ = this.usersService.createBinanceAccount(this.acc).subscribe(
            (res: BinanceAccount) => {
                this.isSending = false;
                res.testStatus = ACC_STATE_INITIAL;
                this.accs.push(res);
                this.acc = new BinanceAccount(); // clear form
                this.form.reset();
                this.form.markAsPristine();
                this.error = null;
                this.formOpened = false;
                this.usersService.botState = 'ready';
                this.testAcc(res); // and test it
            },
            err => {
                this.isSending = false;
                this.error = null;
                this.usersService.botState = 'ready';
                this._handleErrors(err.error);
            }
        );
    }

    openForm() {
        this.formOpened = !this.formOpened;
    }

    deleteAcc(a: BinanceAccount) {
        if (this.isDeleting) return;
        if (this._dltAccSub$) this._dltAccSub$.unsubscribe();

        this.openConfirmDialog(`Delete api keys ${a.name}?`, 'Delete').then(confirmed => {
            if (!confirmed) return;
            this.isDeleting = true;
            this.usersService.botState = 'cooling';
            this._dltAccSub$ = this.usersService.deleteBinanceAccount(a).subscribe(
                () => {
                    this.usersService.botState = 'ready';
                    this.isDeleting = false;
                    for (let i = 0; i < this.accs.length; i++) {
                        if (a.id === this.accs[i].id) {
                          this.accs.splice(i, 1);
                          break;
                        }
                    }
                },
                err => {
                    this.usersService.botState = 'ready';
                    this.isDeleting = false;
                }
            );
        });
    }

    getBtnIcon(a: BinanceAccount): string {
        if (a.testStatus === ACC_STATE_GOOD) return ACC_ICON_GOOD;
        else if (a.testStatus === ACC_STATE_BAD) return ACC_ICON_BAD;
        else return ACC_ICON_INITIAL;
    }

    getTestBtnColor(a: BinanceAccount): string {
        if (a.testStatus === ACC_STATE_GOOD) return ACC_COLOR_GOOD;
        else if (a.testStatus === ACC_STATE_BAD) return ACC_COLOR_BAD;
        else return ACC_COLOR_INITIAL;
    }

    toggleAcc(a: BinanceAccount) {
        if (this.isSwitching) return;
        this.isSwitching = true;
        if (this._tglAccSub$) this._tglAccSub$.unsubscribe();
        this.usersService.botState = 'cooling';
        this._tglAccSub$ = this.usersService.toggleBinanceAccount(a).subscribe(
            (res: any) => {
                this.isSwitching = false;
                this.usersService.botState = 'ready';
                let result = res ? res['active'] : false;
                for (let i = 0; i < this.accs.length; i++) {
                    if (a.id === this.accs[i].id) {
                      this.accs[i].is_active = result;
                      break;
                    }
                }
                this.openSnackBar(result ? 'Аккаунт включен' : 'Аккаунт выключен', 'Закрыть');
            },
            err => {
                this.usersService.botState = 'ready';
                this.isSwitching = false;
                this.openSnackBar(err['error'] ? err['error'] : 'Произошла ошибка', 'Закрыть');
            }
        );
    }

    testAcc(a: BinanceAccount) {
        console.log('test acc', a.id);
        if (this.isTesting) return;
        this.isTesting = true;
        if (this._tstAccSub$) this._tstAccSub$.unsubscribe();
        this._tstAccSub$ = this.usersService.testBinanceAccount(a).subscribe(
            (res: any) => {
                this.isTesting = false;
                let result = res ? res['alive'] : false;
                let assets = [];
                for (let ass of res['assets']) {
                    assets.push(<BinanceAccountAsset>ass);
                }
                for (let i = 0; i < this.accs.length; i++) {
                    if (a.id === this.accs[i].id) {
                      this.accs[i].testStatus = result ? ACC_STATE_GOOD : ACC_STATE_BAD;
                      this.accs[i].assets = assets;
                      break;
                    }
                }
                this.openSnackBar(result ? 'Ключ работает корректно' : 'Ошибка ключа API: ключ не работает', 'Закрыть');
            },
            err => {
                this.isTesting = false;
            }
        );
    }

    openConfirmDialog(dialogText: string, action: string): Promise<any> {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.viewContainerRef = this.vcr;
        this.dialog = this.mdDialog.open(DialogConfirmComponent, dialogConfig);
        this.dialog.componentInstance.dialogText = dialogText;
        this.dialog.componentInstance.action = action;
        return new Promise((resolve, reject) => {
            this.dialog?.afterClosed().subscribe(result => {
                this.dialog = null;
                resolve(result);
            });
        });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 3000 });
    }

    initForm() {
        this.form = this.fb.group({
            name: this.fb.control(this.acc.name, [Validators.required, Validators.maxLength(20)]),
            bnns_key: this.fb.control(this.acc.bnns_key, [Validators.required, Validators.maxLength(100)]),
            bnns_secret: this.fb.control(this.acc.bnns_secret, [Validators.required, Validators.maxLength(100)])
        });
    }

    ngOnInit() {
        this.initForm();

        if (this._bnnsSub$) this._bnnsSub$.unsubscribe();
        this._bnnsSub$ = this.usersService.getBinanceAccounts().subscribe(
            res => {
              res.forEach(a => {
                  a.testStatus = ACC_STATE_INITIAL;
              });
              this.apisReceived = true;
              this.accs = res;
            },
            err => {
              this.apisReceived = false;
            }
        );
    }

    ngOnDestroy() {
        if (this._bnnsSub$) this._bnnsSub$.unsubscribe();
        if (this._crAccSub$) this._crAccSub$.unsubscribe();
        if (this._dltAccSub$) this._dltAccSub$.unsubscribe();
        if (this._tstAccSub$) this._tstAccSub$.unsubscribe();
        if (this._tglAccSub$) this._tglAccSub$.unsubscribe();
    }
}
