import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../services/users.service';
import { BinanceAccount, KeyImage, TradePairType, TradePair, PanelState } from '../objects/objects';

@Component({
    selector: 'trade-pairs-page',
    templateUrl: './trade-pairs.page.html',
    styleUrls: ['/trade-pairs.page.scss']
})
export class TradePairsPage implements OnInit, OnDestroy {
    tradePairTypes: TradePairType[] = [];
    accounts: BinanceAccount[] = [];
    keyImages: KeyImage[] = [];
    pairs: TradePair[] = [];
    newPair: TradePair = new TradePair();
    isReady: boolean = false;
    openedPairs: PanelState[] = []; // opened panels

    private _kiSub$: Subscription | null = null;
    private _tptSub$: Subscription | null = null;
    private _acSub$: Subscription | null = null;
    private _pairsSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private snackBar: MatSnackBar) {}

    getAccounts() {
        if (this._acSub$) this._acSub$.unsubscribe();
        this._acSub$ = this.usersService.getBinanceAccounts().subscribe(
            res => {
              this.accounts = res;
              this.getTradePairTypes();
            }
        );
    }

    getTradePairTypes() {
        if (this._tptSub$) this._tptSub$.unsubscribe();
        this._tptSub$ = this.usersService.getTradePairTypes().subscribe(
            res => {
              this.tradePairTypes = res;
              this.getKeyImages();
            }
        );
    }

    getKeyImages() {
        if (this._kiSub$) this._kiSub$.unsubscribe();
        this._kiSub$ = this.usersService.getKeyImages().subscribe(
            res => {
              this.keyImages = res;
              this.getTradePairs(); // for test only
            }
        );
    }

    getTradePairs() {
        if (this._pairsSub$) this._pairsSub$.unsubscribe();
        this._pairsSub$ = this.usersService.getTradePairs().subscribe(
            (res: TradePair[]) => {
                this.pairs = res;
                this.isReady = true;
            },
            err => {
                this.isReady = true;
            }
        );
    }

    isOpened(pair: TradePair) {
        const index = this.openedPairs.findIndex(p => { return p.id === pair.id && p.opened; });
        return index > -1;
    }

    onPairOpenOrClose(event: PanelState) {
        if (event.closeAll) {
            this.openedPairs = [];
        } else {
            const index = this.openedPairs.findIndex(p => { return p.id === event.id });
            if (index === -1) {
                this.openedPairs.push(event);
            } else {
                this.openedPairs[index] = event;
            }
        }
    }

    onPairCreate(event: TradePair) {
        let pairs = this.pairs.slice();
        pairs.push(event);
        this.pairs = pairs;
        this.newPair = new TradePair();
        this.openSnackBar(`Пара ${event.pair_type?.name} создана`, 'Закрыть');
        this.openedPairs = []; // close all panels
    }

    onPairUpdate(event: TradePair) {
        let index = this.pairs.findIndex(p => { return p.id === event.id; });
        if (index > -1) {
            // don't create new object, just update current
            let p = this.pairs[index];
            this.pairs[index] = Object.assign(p, event);
            this.openSnackBar(`Пара ${event.pair_type?.name} обновлена`, 'Закрыть');
        }
    }

    onPairDelete(event: TradePair) {
        let pairs = this.pairs.slice();
        pairs = pairs.filter(p => p.id !== event.id);
        this.pairs = pairs;
        this.openedPairs = []; // close all panels
        this.openSnackBar(`Пара ${event.pair_type?.name} удалена`, 'Закрыть');
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, { duration: 3000 });
    }

    ngOnInit() {
        // get binance accounts for user and other stuff
        this.getAccounts();
    }

    ngOnDestroy() {
        if (this._acSub$) this._acSub$.unsubscribe();
        if (this._tptSub$) this._tptSub$.unsubscribe();
        if (this._kiSub$) this._kiSub$.unsubscribe();
        if (this._pairsSub$) this._pairsSub$.unsubscribe();
    }
}
