import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsersService } from '../services/users.service';

@Component({
    selector: 'logging-page',
    templateUrl: './logging.page.html',
    styleUrls: ['/logging.page.scss']
})
export class LoggingPage implements OnInit, OnDestroy {
  logs: String[] = [];

  private _logSub$: Subscription | null = null;

  constructor(private usersService: UsersService) {
  }

  ngOnInit() {
    this.logs = this.usersService.logs.slice();

    this._logSub$ = this.usersService.logger$.subscribe(
        res => {
          this.logs.push(res);
          // prevent too large, cut first part
          if (this.logs.length > 10000) {
            this.logs.splice(0, 5000);
          }
        }
    );
  }

  ngOnDestroy() {
    if (this._logSub$) this._logSub$.unsubscribe();
  }
}
