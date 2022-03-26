import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User, TradeSignal, PaginatedTradeSignal, Tweet, PaginatedTweet } from '../objects/objects';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'home-page',
    templateUrl: './home.page.html',
    styleUrls: ['/home.page.scss']
})
export class HomePage {
    isReady: boolean = false;
    signals: TradeSignal[] = [];
    page: number = 1;
    hasMore: boolean = true;
    isLoading: boolean = false;

    tweetsReady: boolean = false;
    tweets: Tweet[] = [];
    pageTweet: number = 1;
    hasMoreTweets: boolean = true;
    isLoadingTweets: boolean = false;

    private _signSub$: Subscription | null = null;
    private _twSub$: Subscription | null = null;
    private _sigstreamSub$: Subscription | null = null;

    constructor(private usersService: UsersService,
                private authService: AuthService) {
    }

    private getSignals() {
        if (!this.hasMore || this.isLoading) return;

        this.isLoading = true;
        if (this._signSub$) this._signSub$.unsubscribe();
        this._signSub$ = this.usersService.getTradeSignals(this.page).subscribe(
            (res: PaginatedTradeSignal) => {
                this.signals = this.signals.concat(res.results);
                this.hasMore = (this.signals.length < res.count);
                this.isReady = true;
                this.isLoading = false;
                this.page++;
            },
            err => {
                console.log('error');
                this.isLoading = false;
            }
        );
    }

    loadMore() {
        if (!this.hasMore || this.isLoading) return;
        this.getSignals();
    }

    getState(sig: TradeSignal): string {
        return this.usersService.getState(sig);
    }

    drawTime(sig: TradeSignal): Date {
        return new Date(sig.created_at);
    }

    private getTweets() {
        if (!this.hasMoreTweets || this.isLoadingTweets) return;

        this.isLoadingTweets = true;
        if (this._twSub$) this._twSub$.unsubscribe();
        this._twSub$ = this.usersService.getTweets(this.pageTweet).subscribe(
            (res: PaginatedTweet) => {
                this.tweets = this.tweets.concat(res.results);
                this.hasMoreTweets = (this.tweets.length < res.count);
                this.tweetsReady = true;
                this.isLoadingTweets = false;
                this.pageTweet++;
            },
            err => {
                console.log('error');
                this.isLoading = false;
            }
        );
    }

    loadMoreTweets() {
        if (!this.hasMoreTweets || this.isLoadingTweets) return;
        this.getTweets();
    }

    onSignal(sig: TradeSignal) {
        if (!sig || !this.isReady) return;
        // put new or changed signal on first place
        const index = this.signals.findIndex(s => { return sig.id === s.id });
        if (index > -1) {
            this.signals.splice(index, 1);
        }
        this.signals.unshift(sig);
    }

    subscribeToSignals() {
        this._sigstreamSub$ = this.usersService.signal$.subscribe(
            res => {
                this.onSignal(<TradeSignal>res);
            }
        );
    }

    ngOnInit() {
        if (this.authService.isAuthorized()) {
          this.getSignals();
          this.getTweets();
          this.subscribeToSignals();
        }
    }

    ngOnDestroy() {
        if (this._signSub$) this._signSub$.unsubscribe();
        if (this._twSub$) this._twSub$.unsubscribe();
        if (this._sigstreamSub$) this._sigstreamSub$.unsubscribe();
    }
}
