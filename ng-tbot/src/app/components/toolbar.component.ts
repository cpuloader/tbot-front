import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../objects/objects';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { WebSocketService } from '../services/websocket.service';

const SBTN_TEXT_STOP: string = 'Остановить';
const SBTN_TEXT_START: string = 'Запустить';
const SBTN_ICON_STOP: string = 'stop';
const SBTN_ICON_START: string = 'play_arrow';
const IBTN_TEXT_ON: string = 'Бот работает';
const IBTN_TEXT_OFF: string = 'Бот выключен';
const IBTN_COLOR_STOP: string = '#1ad500';
const IBTN_COLOR_START: string = '#ff5a5a';
const CONN_COLOR_FAIL: string = '#ff4500';
const CONN_COLOR_OK: string = '#1ad500';
const CONN_COLOR_PING: string = '#0f8000';

@Component({
    selector: 'toolbar-on-top',
    templateUrl: './toolbar.component.html',
    styleUrls: ['/toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnChanges, OnDestroy {

    @Input()user: User | null;

    botStatus: boolean = true;
    isCooling: boolean = false;

    connectionColor: string = 'red';

    private _wsStateSub$: Subscription | null = null;
    private _msgSub$: Subscription | null = null;
    private _botSub$: Subscription | null = null;
    private _botStateSub$: Subscription | null = null;

    private _timeout: number = 0;

    constructor(private usersService: UsersService,
                private authService: AuthService,
                private webSocketService: WebSocketService) {
    }

    getIndBtnColor(): string {
        return this.botStatus ? IBTN_COLOR_STOP : IBTN_COLOR_START;
    }

    getIndBtnText(): string {
        return this.botStatus ? IBTN_TEXT_ON : IBTN_TEXT_OFF;
    }

    getSwitchBtnIcon(): string {
        return this.botStatus ? SBTN_ICON_STOP : SBTN_ICON_START;
    }

    getSwitchBtnText(): string {
        return this.botStatus ? SBTN_TEXT_STOP : SBTN_TEXT_START;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['user'] && changes['user'].currentValue) {
            this.botStatus = this.user ? this.user.bot_is_active : false;
        }
    }

    switchBot() {
        if (this.isCooling) return;
        if (this._botSub$) this._botSub$.unsubscribe();
        this._botSub$ = this.usersService.toggleBot().subscribe(
            res => {
                if (res['active'] != undefined) {
                    this.botStatus = res['active']
                    this.isCooling = true;
                    // wait 5 sec
                    setTimeout(() => { this.isCooling = false }, 5000);
                }
            }
        );
    }

    logout() {
        this.authService.logout().subscribe(() => this.usersService.cleanAll() );
    }

    subscribeToBotState() {
        this._botStateSub$ = this.usersService.botState$.subscribe(
            state => {
                if (state === 'cooling') this.isCooling = true;
                else this.isCooling = false;
            }
        );
    }

    // subscription for incoming ws messages
    subscribeToIncomingMessages() {
        this._msgSub$ = this.webSocketService.messages
            .subscribe(
                (msg: any) => {
                  if (msg['alive']) {
                      this.connectionColor = CONN_COLOR_PING;
                      this._timeout = setTimeout(() => {this.connectionColor = CONN_COLOR_OK}, 2000);
                      this.usersService.logger = 'bot is alive';
                  } else if ((msg['positions'] != undefined)) {
                      this.usersService.positions = msg;
                  } else if ((msg['signal'] != undefined)) {
                      this.usersService.signal = msg['signal'];
                  } else if ((msg['logs'] != undefined)) {
                      this.usersService.logger = msg['logs'];
                  }
                },
                err => {
                    clearTimeout(this._timeout);
                    this.connectionColor = CONN_COLOR_FAIL;
                    console.log('ws connection lost', err);
                }
            );
    }

    ngOnInit() {
        if (!this.user || !this.user.id) {
            console.log("NO USER in toolbar!");
            return;
        }
        this.webSocketService.openWS(this.user.id);    // start websocket session
        this._wsStateSub$ = this.webSocketService.socketState$.subscribe(
            res => {
                if (res === 'connect') {
                    if (!this._msgSub$) {
                        this.subscribeToIncomingMessages();
                    }
                    this.connectionColor = CONN_COLOR_OK;
                } else if (res === 'disconnect' && this._msgSub$) {
                    clearTimeout(this._timeout);
                    this.connectionColor = CONN_COLOR_FAIL;
                }
            });

        this.subscribeToBotState();
    }

    ngOnDestroy() {
        this.webSocketService.closeWS(true);
        if (this._wsStateSub$) this._wsStateSub$.unsubscribe();
        if (this._msgSub$) this._msgSub$.unsubscribe();
        if (this._botSub$) this._botSub$.unsubscribe();
        if (this._botStateSub$) this._botStateSub$.unsubscribe();
    }
}
