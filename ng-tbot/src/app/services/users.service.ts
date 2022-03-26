import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, BinanceAccount, TradePairType, TradePair, TradeSignal, PaginatedTradeSignal,
         KeyImage, TwitterAccount, TwitterPerson, Tweet, PaginatedTweet, Position,
         PositionsWrapper, EmailData } from '../objects/objects';
import { ConfigService } from './config';
import { AuthService } from './auth.service';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
    private apiUrl: string;

    constructor(private httpClient: HttpClient,
                private config: ConfigService,
                private authService: AuthService,
                private headers: HeadersService) {

        this.apiUrl = this.config.getApiUrl();
    }

    // position events stream
    private _positions$: BehaviorSubject<PositionsWrapper | null> = new BehaviorSubject<PositionsWrapper | null>(null);
    public set positions(posArray: PositionsWrapper) {
        this._positions$.next(posArray);
    }
    public get positions$(): Observable<PositionsWrapper | null> {
        return this._positions$.asObservable();
    }

    // signal events stream
    private _signal$: BehaviorSubject<TradeSignal | null> = new BehaviorSubject<TradeSignal | null>(null);
    public set signal(sig: TradeSignal) {
        this._signal$.next(sig);
    }
    public get signal$(): Observable<TradeSignal | null> {
        return this._signal$.asObservable();
    }

    // bot state events stream
    private _botState$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public set botState(state: string) {
        this._botState$.next(state);
    }
    public get botState$(): Observable<string> {
        return this._botState$.asObservable();
    }

    public logs: String[] = [];
    private _logger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    public set logger(msg: string) {
        this._logger$.next(msg);
        this.logs.push(msg);
        // prevent too large, cut first part
        if (this.logs.length > 10000) {
          this.logs.splice(0, 5000);
        }
    }
    public get logger$(): Observable<string> {
        return this._logger$.asObservable();
    }

    // BINANCE ACCS

    getBinanceAccounts(): Observable<BinanceAccount[]> {
        const url: string = `${this.apiUrl}/baccounts/`;
        return this.httpClient.get<BinanceAccount[]>(url);
    }

    createBinanceAccount(acc: BinanceAccount): Observable<BinanceAccount> {
        const url = `${this.apiUrl}/baccounts/`;
        return this.httpClient
            .post<BinanceAccount>(url, acc, { headers: this.headers.makeCSRFHeader() });
    }

    updateBinanceAccount(acc: BinanceAccount): Observable<BinanceAccount> {
        const url: string = `${this.apiUrl}/baccounts/${acc.id}/`;
        let proxyAcc = JSON.parse(JSON.stringify(acc));
        return this.httpClient
            .put<BinanceAccount>(url, proxyAcc, { headers: this.headers.makeCSRFHeader() });
    }

    deleteBinanceAccount(acc: BinanceAccount): Observable<any> {
        const url = `${this.apiUrl}/baccounts/${acc.id}/`;
        return this.httpClient
            .delete(url, { headers: this.headers.makeCSRFHeader() });
    }

    testBinanceAccount(acc: BinanceAccount): Observable<any> {
        const url = `${this.apiUrl}/bnns/verify/${acc.id}/`;
        return this.httpClient.get(url);
    }

    toggleBinanceAccount(acc: BinanceAccount): Observable<any> {
        const url = `${this.apiUrl}/bnns/activate/${acc.id}/`;
        return this.httpClient.post(url, {}, { headers: this.headers.makeCSRFHeader() });
    }

    getTradePairTypes(): Observable<TradePairType[]> {
        const url = `${this.apiUrl}/bnns/pairtypes/`;
        return this.httpClient.get<TradePairType[]>(url);
    }

    getKeyImages(): Observable<KeyImage[]> {
        const url = `${this.apiUrl}/bnns/keyimages/`;
        return this.httpClient.get<KeyImage[]>(url);
    }

    getTradePairs(): Observable<TradePair[]> {
        const url = `${this.apiUrl}/pairs/`;
        return this.httpClient.get<TradePair[]>(url);
    }

    createTradePair(tp: TradePair): Observable<TradePair> {
        const url = `${this.apiUrl}/pairs/`;
        return this.httpClient.post<TradePair>(url, tp, { headers: this.headers.makeCSRFHeader() });
    }

    updateTradePair(tp: TradePair): Observable<TradePair> {
        const url = `${this.apiUrl}/pairs/${tp.id}/`;
        return this.httpClient.put<TradePair>(url, tp, { headers: this.headers.makeCSRFHeader() });
    }

    deleteTradePair(tp: TradePair): Observable<any> {
        const url = `${this.apiUrl}/pairs/${tp.id}/`;
        return this.httpClient
            .delete(url, { headers: this.headers.makeCSRFHeader() });
    }

    // BOT ACTIVITY

    toggleBot(): Observable<any> {
        const url = `${this.apiUrl}/bnns/botstate/`;
        return this.httpClient.post(url, {}, { headers: this.headers.makeCSRFHeader() });
    }

    // TWITTER STUFF

    getTwitterAccounts(): Observable<TwitterAccount[]> {
        const url: string = `${this.apiUrl}/taccounts/`;
        return this.httpClient.get<TwitterAccount[]>(url);
    }

    createTwitterAccount(ta: TwitterAccount): Observable<TwitterAccount> {
        const url = `${this.apiUrl}/taccounts/`;
        return this.httpClient.post<TwitterAccount>(url, ta, { headers: this.headers.makeCSRFHeader() });
    }

    updateTwitterAccount(ta: TwitterAccount): Observable<TwitterAccount> {
        const url = `${this.apiUrl}/taccounts/${ta.id}/`;
        return this.httpClient.put<TwitterAccount>(url, ta, { headers: this.headers.makeCSRFHeader() });
    }

    deleteTwitterAccount(ta: TwitterAccount): Observable<any> {
        const url = `${this.apiUrl}/taccounts/${ta.id}/`;
        return this.httpClient
            .delete(url, { headers: this.headers.makeCSRFHeader() });
    }

    getTwitterPersons(): Observable<TwitterPerson[]> {
        const url: string = `${this.apiUrl}/tpersons/`;
        return this.httpClient.get<TwitterPerson[]>(url);
    }

    createTwitterPerson(tp: TwitterPerson): Observable<TwitterPerson> {
        const url = `${this.apiUrl}/tpersons/`;
        return this.httpClient.post<TwitterPerson>(url, tp, { headers: this.headers.makeCSRFHeader() });
    }

    deleteTwitterPerson(tp: TwitterPerson): Observable<any> {
        const url = `${this.apiUrl}/tpersons/${tp.id}/`;
        return this.httpClient
            .delete(url, { headers: this.headers.makeCSRFHeader() });
    }

    // SIGNALS

    getTradeSignals(page: number): Observable<PaginatedTradeSignal> {
        const url: string = `${this.apiUrl}/signals/?page=${page}`;
        return this.httpClient.get<PaginatedTradeSignal>(url);
    }

    setTradeSignalState(id: number, state: number): Observable<any> {
        const url = `${this.apiUrl}/bnns/signalstate/${id}/`;
        return this.httpClient.post(url, {'state': state}, { headers: this.headers.makeCSRFHeader() });
    }

    sendSignalForPair(id: number): Observable<any> {
        const url = `${this.apiUrl}/bnns/sendsignal/${id}/`;
        return this.httpClient.post(url, {}, { headers: this.headers.makeCSRFHeader() });
    }

    // TWEETS

    getTweets(page: number): Observable<PaginatedTweet> {
        const url: string = `${this.apiUrl}/tweets/?page=${page}`;
        return this.httpClient.get<PaginatedTweet>(url);
    }

    // POSITIONS

    getPositions(): Observable<PositionsWrapper> {
        const url = `${this.apiUrl}/bnns/positions/`;
        return this.httpClient.get<PositionsWrapper>(url);
    }

    closePosition(bacc_id: number, symbol1: string, symbol2: string, is_coin: boolean): Observable<any> {
        const url = `${this.apiUrl}/bnns/closepos/?baccid=${bacc_id}&symbol1=${symbol1}&symbol2=${symbol2}&is_coin=${is_coin}`;
        return this.httpClient.put(url, {}, { headers: this.headers.makeCSRFHeader() });
    }

    // EMAIL SMTP DATA

    getEmailData(): Observable<EmailData> {
        const url = `${this.apiUrl}/emaildata/1/`;
        return this.httpClient.get<EmailData>(url);
    }

    createEmailData(emaildata: EmailData): Observable<EmailData> {
        const url = `${this.apiUrl}/emaildata/`;
        return this.httpClient.post<EmailData>(url, emaildata, { headers: this.headers.makeCSRFHeader() });
    }

    // other stuff

    cleanAll(): void {
        this.resetSubjects();
    }

    resetSubjects(): void {
        // no subjects
    }

    getState(sig: TradeSignal): string {
        let state;
        switch(sig.state) {
            case 0: state = 'Новый'; break;
            case 1: state = 'В работе'; break;
            case 2: state = 'Завершен'; break;
            case 3: {
              state = (sig.close_market_price > 0) ? 'Завершен' : 'Прерван';
            } break;
            case 4: state = 'Проигнорирован'; break;
            default: state = 'Неизвестно';
        }
        return state;
    }

}
