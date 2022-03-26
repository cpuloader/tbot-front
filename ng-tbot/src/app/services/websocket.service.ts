import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, BinanceAccount, TradePairType, TradePair, KeyImage } from '../objects/objects';
import { ConfigService } from './config';
import { AuthService } from './auth.service';
import { WindowRef } from './window';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
    private subject: Subject<MessageEvent>;
    private ws: WebSocket;
    private checkLoop: any;
    private url: string;
    private userId: number;
    private chatUrl: string;
    private shouldReconnect: boolean = true;
    private reconnectAttempts: number = 0;

    constructor(private windowRef: WindowRef,
                private config: ConfigService,
                private authService: AuthService) {
        this.chatUrl = this.config.getUserUrl();
    }

    public messages: Subject<any>  = new Subject<any>();

    private _socketState$: BehaviorSubject<string> = new BehaviorSubject('');
    get socketState$(): Observable<string> {
        return this._socketState$.asObservable();
    }

    openWS(userId: number) {
        this.url = `${this.chatUrl}/${userId}`;
        this.userId = userId;
        this.messages = <Subject<any>>this.connect(this.url)?.pipe(
                map((response: any): any => {
                    //console.log('incoming msg', response.data);
                    return JSON.parse(response.data);
                })
            );
    }

    closeWS(reallyClose: boolean) {
        if (this.ws && reallyClose) {
            this.shouldReconnect = false;
            console.log('closing socket');
            clearInterval(this.checkLoop);
            this.ws.close();
        }
    }

    private connect(url: string): Subject<any> | null {
        this.url = url;
        if (this.ws) {
            this.ws.close();
        }
        if (!this.authService.isAuthorized()) {
            this.shouldReconnect = false;
            return null;
        }
        this.subject = this.create(this.url);
        return this.subject;
    }

    private create(url: string): Subject<any> {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
            console.log('socket ok');
            this._socketState$.next('connect');  // signal to subscribe in component
            this.reconnectAttempts = 0;
        };
        this.ws.onerror   = (err) => {
            setTimeout(() => this.check(), this.getBackoffDelay(this.reconnectAttempts));
        };
        let observable = Observable.create(
            (obs: Observer<any>) => {
                this.ws.onmessage = obs.next.bind(obs);
                this.ws.onclose   = () => {
                    obs.complete.bind(obs);
                }
                return;
        });
        let observer = {
            next: (data: Object) => {
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(data));
                }
            }
        };
        return Subject.create(observer, observable);
    }

    private check() {
        if (!this.ws || this.ws.readyState == 3 && this.url && this.shouldReconnect) {
            this._socketState$.next('disconnect');  // signal to unsubscribe in component
            this.reconnectAttempts++;
            this.openWS(this.userId);
        }
    }

    private getBackoffDelay(attempt: number) {
        let R = Math.random() + 1;
        let T = 500;     // initial timeout
        let F = 2;
        let N = attempt;
        let M = 300000;  // max timeout
        return Math.floor(Math.min(R * T * Math.pow(F, N), M));
    }
}
