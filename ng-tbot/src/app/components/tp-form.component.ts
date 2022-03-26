import { Component, Input, Output, OnDestroy, ViewChild, EventEmitter,
         ViewContainerRef, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray, AbstractControl, FormBuilder, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatChipList, MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionPanel } from '@angular/material/expansion';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UsersService } from '../services/users.service';
import { BinanceAccount, KeyImage, TradePairType, TradePair, PanelState } from '../objects/objects';
import { DialogConfirmComponent } from './dialog-confirm.component';
import { removeFirst } from '../utils/utils';

@Component({
    selector: 'trade-pair-form',
    templateUrl: './tp-form.component.html',
    styleUrls: ['/tp-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradePairFormComponent implements OnChanges, OnDestroy {
    @Input()tradePairTypes: TradePairType[] = [];
    @Input()accounts: BinanceAccount[] = [];
    @Input()keyImages: KeyImage[] = [];
    @Input()sourcePair: TradePair;
    @Input()close: boolean = true;
    @Output()pairUpdated: EventEmitter<TradePair> = new EventEmitter<TradePair>();
    @Output()pairCreated: EventEmitter<TradePair> = new EventEmitter<TradePair>();
    @Output()pairDeleted: EventEmitter<TradePair> = new EventEmitter<TradePair>();
    @Output()openedOrClosed: EventEmitter<PanelState> = new EventEmitter<PanelState>();

    pair: TradePair = new TradePair(); // deep copy of input
    form: FormGroup;
    isPrepared: boolean = false;
    isReady: boolean = false;
    success: boolean = false;
    isSending: boolean = false;
    error: any = null;
    accountsForTitle: string;
    isOpened: boolean = false;
    coinName: string = 'USDT';

    componentId: number = Math.random(); // TEST

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    dialog: MatDialogRef<any> | null = null;

    @ViewChild('expPanel') expPanel: MatExpansionPanel;
    @ViewChild('accountsList') accountsList: MatChipList;
    @ViewChild('keywordsList') keywordsList: MatChipList;
    @ViewChild('keyimagesList') keyimagesList: MatChipList;

    private _kwSub$: Subscription | null = null;
    private _kiSub$: Subscription | null = null;
    private _tptSub$: Subscription | null = null;
    private _acSub$: Subscription | null = null;
    private _crtpwSub$: Subscription | null = null;
    private _formSub$: Subscription | null = null;
    private _accountsSub$: Subscription | null = null;
    private _keywordsSub$: Subscription | null = null;
    private _keyimagesSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private vcr: ViewContainerRef,
                private mdDialog: MatDialog,
                private snackBar: MatSnackBar,
                private fb: FormBuilder) {}

    get accountsControl(): FormControl {
        return this.form.controls.accounts as FormControl;
    }

    get keyWordsControl(): FormArray {
        return this.form.controls.key_words as FormArray;
    }

    get keyImagesControl(): FormControl {
        return this.form.controls.key_images as FormControl;
    }

    makeCoinName() {
        if (this.pair && this.pair.pair_type && this.pair.pair_type.is_coin) {
            this.coinName = this.pair.pair_type.name.split(" / ")[0];
        } else {
            this.coinName = 'USDT';
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['sourcePair'] && changes['sourcePair'].currentValue) {
            //console.log('changes for', this.componentId, changes['sourcePair'].currentValue);
            // new object passed, update pair and form data
            this.setupPair();
            if (this.form) { // panel was expanded once and form exists
                //console.log('new pair:', this.pair);
                this.form.patchValue(this.pair);
            }
            this.isPrepared = true;
        } else if (changes['close']) {
            const isOpened = changes['close'].currentValue;
            if (this.isOpened != isOpened) {
                if (isOpened) this.expPanel.open();
                else this.expPanel.close();
            }
        }
    }

    onPanelOpen(event: any) {
        if (!this.isReady) {
            this.initForm();
        }
        this.isReady = true;
        this.isOpened = true;
        this.openedOrClosed.emit(<PanelState>{'id': this.pair.id, 'opened': true, 'closeAll': false});
    }

    onPanelClose(event: any) {
        this.isOpened = false;
        this.openedOrClosed.emit(<PanelState>{'id': this.pair.id, 'opened': false, 'closeAll': false});
    }

    drawAccounts() {
        let accs = '';
        for (let i = 0; i < this.pair.accounts.length-1; i++) {
            accs += this.pair.accounts[i].name + ', ';
        }
        if (this.pair.accounts.length) {
            accs += this.pair.accounts[this.pair.accounts.length-1].name;
        }
        this.accountsForTitle = accs;
    }

    removeAccount(acc: BinanceAccount) {
        const alist = this.accountsControl.value as BinanceAccount[];
        removeFirst(alist, acc);
        this.accountsControl.markAsTouched(); // to trigger mat-error
        this.accountsControl.setValue(alist.slice()); // to trigger change detection
    }

    addKeyword(event: MatChipInputEvent): void {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        this.keyWordsControl.push(this.fb.control(value.trim()));
      }

      if (input) {
        input.value = '';
      }
    }

    removeKeyword(kw: string): void {
      const index = this.keyWordsControl.value.indexOf(kw);

      if (index >= 0) {
        this.keyWordsControl.removeAt(index);
      }
    }

    removeKeyImage(ki: KeyImage) {
        const kilist = this.keyImagesControl.value as KeyImage[];
        removeFirst(kilist, ki);
        this.keyImagesControl.markAsTouched();
        this.keyImagesControl.setValue(kilist.slice());
    }

    onToggleLongChange(event: any) {
        if (event.value == "true") this.form.controls.is_long.setValue(true);
        else this.form.controls.is_long.setValue(false);
    }

    onSliderChanged(event: any) {
        this.form.controls.leverage.setValue(event.value);
    }

    drawSliderValue(): string {
        return `${this.form.controls.leverage.value}X`;
    }

    toggleActive() {
        let v = this.form.controls.is_active.value;
        this.form.controls.is_active.setValue(!v);
    }

    toggleReverse() {
        let v = this.form.controls.can_reverse.value;
        this.form.controls.can_reverse.setValue(!v);
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
        } else if (this.form.controls[fieldName].hasError('max')) {
            return 'Максимальное значение 100';
        } else if (this.form.controls[fieldName].hasError('min')) {
            return 'Минимальное значение 0';
        } else if (this.form.controls[fieldName].hasError('must_be_one_sum')) {
            return 'Нужно ввести ненулевую сумму ИЛИ проценты';
        } else if (this.form.controls[fieldName].errors) {
            //console.log('getErrorMessage', this.form.controls[fieldName].errors);
            return this.form.controls[fieldName].errors;
        }
        return null;
    }

    send() {
        if (this.form.invalid) return;

        if (this.form.controls.sum.value === null) {
            this.form.controls.sum.patchValue(0);
        }
        if (this.form.controls.sum_percent.value === null) {
            this.form.controls.sum_percent.patchValue(0);
        }
        this._saveBackup(); // this.pair updated

        this.isSending = true;

        if (this._crtpwSub$) this._crtpwSub$.unsubscribe();
        if(this.pair.id > 0) {
            this.update();
        } else {
            this.create();
        }
    }

    create() {
        this.usersService.botState = 'cooling';
        this._crtpwSub$ = this.usersService.createTradePair(this.pair).subscribe(
            (res: TradePair) => {
                this.isSending = false;
                this.error = null;
                this.usersService.botState = 'ready';
                this.pairCreated.emit(res);
                this.expPanel.close();
            },
            err => {
                console.log('err', err);
                this.isSending = false;
                this.error = null;
                this._handleErrors(err.error);
                this.usersService.botState = 'ready';
            }
        );
    }

    update() {
        this.usersService.botState = 'cooling';
        this._crtpwSub$ = this.usersService.updateTradePair(this.pair).subscribe(
            (res: TradePair) => {
                this.isSending = false;
                this.error = null;
                this.usersService.botState = 'ready';
                this.pairUpdated.emit(res);
                this.drawAccounts();
            },
            err => {
                this.isSending = false;
                this.error = null;
                this._handleErrors(err.error);
                this.usersService.botState = 'ready';
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

    deletePair() {
        if (this.isSending || !this.pair.id) return;
        if (this._crtpwSub$) this._crtpwSub$.unsubscribe();

        this.openConfirmDialog(`Удалить эту торговую пару?`, 'Удалить').then(confirmed => {
            if (!confirmed) return;
            this.isSending = true;
            this.usersService.botState = 'cooling';
            this._crtpwSub$ = this.usersService.deleteTradePair(this.pair).subscribe(
                () => {
                    this.isSending = false;
                    this.usersService.botState = 'ready';
                    this.pairDeleted.emit(this.pair);
                },
                err => {
                    this.isSending = false;
                    this.usersService.botState = 'ready';
                }
            );
        });
    }

    createSignal() {
        this._crtpwSub$ = this.usersService.sendSignalForPair(this.pair.id).subscribe(
            (res: TradePair) => {
                this.isSending = false;
                this.error = null;
                this.openSnackBar('Сигнал успешно создан', 'Закрыть');
            },
            err => {
                console.log('err', err);
                this.isSending = false;
                this.error = null;
                this.openSnackBar('Ошибка!', 'Закрыть');
            }
        );
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 3000 });
    }

    // utils
    compareFn(v1: KeyImage | BinanceAccount | null, v2: KeyImage | BinanceAccount | null): boolean {
        if (!v1 || !v2) return false;
        return v1.id === v2.id;
    }

    validateSums(n: number): ValidatorFn {
        return (): { [key: string]: boolean} | null => {
            if (this.form && this.checkSums(n)) {
                return {'must_be_one_sum': true};
            }
            return null;
        }
    }

    checkSums(n: number) {
        let s1 = +this.form.controls.sum.value;
        let s2 = +this.form.controls.sum_percent.value;
        if (s1 > 0 && s2 > 0) {
            if (n === 2) {
              this.form.controls.sum.patchValue(0);
              s1 = 0;
            } else {
              this.form.controls.sum_percent.patchValue(0);
              s2 = 0;
            }
        } else if (s1 == 0 && s2 == 0) {
            return true;
        }
        return (s1 > 0 && s2 > 0 && s1 === s2);
    }

    private _saveBackup() {
        this.pair = Object.assign(this.pair, this.form.value);
    }

    setupPair() {
        this.pair = Object.assign(this.pair, this.sourcePair);
        this.makeCoinName();
        this.drawAccounts();
    }

    initForm() {
        this.form = this.fb.group({
            pair_type: this.fb.control({value: this.pair.pair_type, disabled: (this.pair.id > 0)}, [Validators.required]),
            accounts: this.fb.control(this.pair.accounts, []),
            key_words: this.fb.array(this.pair.key_words, []),
            key_images: this.fb.control(this.pair.key_images, []),
            is_active: this.fb.control(this.pair.is_active, []),
            is_long: this.fb.control(this.pair.is_long, []),
            leverage: this.fb.control(this.pair.leverage, [Validators.required]),
            sum: this.fb.control(this.pair.sum, [this.validateSums(1)]),
            sum_percent: this.fb.control(this.pair.sum_percent, [this.validateSums(2)]),
            stop_loss_percent: this.fb.control(this.pair.stop_loss_percent, [Validators.required]),
            on_rise_percent: this.fb.control(this.pair.on_rise_percent, [Validators.required]),
            trade_stop_percent: this.fb.control(this.pair.trade_stop_percent, [Validators.required]),
            can_reverse: this.fb.control(this.pair.can_reverse, []),
        });

        if (this._formSub$) this._formSub$.unsubscribe();
        this._formSub$ = this.form.valueChanges.subscribe(
            value => {
                if (!this.checkSums(1)) this.form.controls.sum.setErrors(null);
                if (!this.checkSums(2)) this.form.controls.sum_percent.setErrors(null);
                //console.log('form value changed', this.form);
                this._saveBackup();
            }
        );

        if (this._accountsSub$) this._accountsSub$.unsubscribe();
        let facc = this.form.get('accounts');
        if (facc) {
            this._accountsSub$ = facc.statusChanges.subscribe(
                status => {
                    if (this.accountsList) this.accountsList.errorState = status === 'INVALID'
                }
            );
        } else {
            console.log('fuck');
        }

        if (this._keywordsSub$) this._keywordsSub$.unsubscribe();
        let fkw = this.form.get('key_words');
        this._keywordsSub$ = fkw ? fkw.statusChanges.subscribe(
            status => {
                if (this.keywordsList) {
                    this.keywordsList.errorState = status === 'INVALID'
                }
            }
        ) : null;

        if (this._keyimagesSub$) this._keyimagesSub$.unsubscribe();
        let fki = this.form.get('key_images');
        this._keyimagesSub$ = fki ? fki.statusChanges.subscribe(
            status => {
                if (this.keyimagesList) {
                    this.keyimagesList.errorState = status === 'INVALID'
                }
            }
        ) : null;
    }

    clearAllSubs() {
        if (this._acSub$) this._acSub$.unsubscribe();
        if (this._tptSub$) this._tptSub$.unsubscribe();
        if (this._kwSub$) this._kwSub$.unsubscribe();
        if (this._kiSub$) this._kiSub$.unsubscribe();
        if (this._crtpwSub$) this._crtpwSub$.unsubscribe();
        if (this._formSub$) this._formSub$.unsubscribe();
        if (this._accountsSub$) this._accountsSub$.unsubscribe();
        if (this._keywordsSub$) this._keywordsSub$.unsubscribe();
        if (this._keyimagesSub$) this._keyimagesSub$.unsubscribe();
    }

    ngOnDestroy() {
        this.clearAllSubs();
    }
}
