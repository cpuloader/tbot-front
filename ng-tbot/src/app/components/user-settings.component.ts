import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../objects/objects';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config';
import { WindowRef } from '../services/window';
import { CookieTools } from '../services/cookie-tools.service';

@Component({
    selector: 'user-settings-component',
    templateUrl: './user-settings.component.html',
    styleUrls: ['/user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
    user: User = new User();
    error: any;
    isSending: boolean = false;

    private _userSub: Subscription | null = null;
    private _updSub: Subscription | null = null;

    constructor(private usersService: UsersService,
                private windowRef: WindowRef,
                private config: ConfigService,
                private authService: AuthService
                ) {
    }

    submit() {
      if (this._updSub) this._updSub.unsubscribe();

      this._updSub = this.authService.updateUser(this.user).subscribe(
          res => {
              this.isSending = false;
          },
          err => {
              this.isSending = false;
          });
    }

    private _subscribeForUser() {
      this._userSub = this.authService.userUpdated$.subscribe(
        (user: User | null) => {
          if (user) {
            this.user = user;
          } else {
            this.user = new User();
          }
        });
    }

    ngOnInit() {
        if (this.authService.isAuthorized()) {
          let usr = this.authService.getMe();
          this.user = usr ? usr : new User();
          this._subscribeForUser();
        } else {
          this.user = new User();
        }
    }

    ngOnDestroy() {
        if (this._userSub) this._userSub.unsubscribe();
        if (this._updSub) this._updSub.unsubscribe();
    }
}
