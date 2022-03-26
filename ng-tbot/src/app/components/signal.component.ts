import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TradeSignal } from '../objects/objects';
import { UsersService } from '../services/users.service';


@Component({
    selector: 'trade-signal',
    templateUrl: './signal.component.html',
    styleUrls: ['/signal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeSignalComponent implements OnChanges, OnDestroy {
    @Input()signal: TradeSignal;

    state: string = '----';
    created_at: any;
    isSending: boolean = false;
    twitLink: string = '';
    showTweet: boolean = false;
    first_market_price: string = '---';
    close_market_price: string = '---';
    duration: string;
    currency: string;
    result: string = '---';

    private _sigSub$: Subscription | null = null;

    constructor(private usersService: UsersService, private cdr: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['signal'] && changes['signal'].currentValue) {
            let sig = changes['signal'].currentValue;
            this.state = this.getState(sig);
            this.first_market_price = (sig.first_market_price > 0) ? `${parseFloat(sig.first_market_price).toFixed(5)} ${sig.currency}` : '---';
            this.close_market_price = (sig.close_market_price > 0) ? `${parseFloat(sig.close_market_price).toFixed(5)} ${sig.currency}` : '---';
            this.created_at = new Date(sig.created_at);
            this.duration = this.makeDuration(sig);
            this.currency = sig.is_coin ? 'Cont' : sig.symbol.split(" / ")[0];
            if (sig.close_market_price > 0) {
                let r = (sig.close_market_price - sig.first_market_price) * sig.first_order_quantity;
                if (!sig.is_long) r *= -1;
                if (sig.is_coin) {
                    if (this.currency == 'BTC') {
                        r /= 100.0; // 100$ contracts
                    } else {
                        r /= 10.0; // 10$ contracts
                    }
                    this.result = `${r.toFixed(5)} ${sig.currency}`;
                } else {
                    this.result = `${r.toFixed(5)} ${sig.currency}`;
                }

            }
        }
    }

    getState(sig: TradeSignal): string {
        return this.usersService.getState(sig);
    }

    toggleShow() {
        this.showTweet = !this.showTweet;
    }

    makeDuration(sig: TradeSignal): string {
        if (!sig.closed_at || !sig.created_at) return '';
        let d = sig.closed_at - new Date(sig.created_at).getTime();
        d = Math.round(d / 1000);
        if (d < 60) {
            return d + ' cек.';
        } else {
            let m = Math.floor(d/60);
            let s = Math.floor(d - m*60);
            return (s > 0) ? (m + ' мин. ' + s + ' сек.') : (m + ' мин.');
        }
    }

    resetSignal() {
        if (this.isSending) return;
        if (this._sigSub$) this._sigSub$.unsubscribe();
        this.isSending = true;
        this._sigSub$ = this.usersService.setTradeSignalState(this.signal.id, 4).subscribe(
            res => {
                this.isSending = false;
                this.signal.state = 4; // Ignored
                this.state = this.getState(this.signal);
                this.cdr.detectChanges();
            },
            err => {
                this.isSending = false;
            }
        );
    }

    ngOnDestroy() {
        if (this._sigSub$) this._sigSub$.unsubscribe();
    }
}
