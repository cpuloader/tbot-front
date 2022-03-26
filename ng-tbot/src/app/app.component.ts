import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router }   from '@angular/router';
import { isPlatformBrowser, Location } from '@angular/common';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AuthService } from './services/auth.service';
import { User } from './objects/objects';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
    logged: boolean = false;
    user: User | null = null;

    private _userSubscription: Subscription | null = null;

    constructor(private router: Router,
                private location: Location,
                private authService: AuthService) {
    }

    login() {
      if (!this.authService.isAuthorized()) {
        this.router.navigate(['/auth/login']);
      }
    }

    logout() {
      if (this.authService.isAuthorized()) {
        this.authService.logout().pipe(first()).subscribe(() => {
          console.log('user logout');
        });
      }
    }

    private _subscribeForUser() {
      this._userSubscription = this.authService.userUpdated$.subscribe(
        (user: User | null) => {
          if (user) {
            this.logged = true;
            this.user = this.authService.getMe();
          } else {
            this.logged = false;
            this.user = null;
          }
        });
    }

    ngOnInit() {
      if (this.authService.checkLoggedUser()) {
        this.logged = true;
        this.user = this.authService.getMe();
        // always get fresh user
        if (!this.location.isCurrentPathEqualTo('/settings') && this.location.path().indexOf('/auth/') == -1) {
          this.authService.getMeByHttp().pipe(first()).subscribe(res => {
            this.user = res;
          });
        }
      } else {
        this.logged = false;
        this.user = null;
      }

      this._subscribeForUser();
    }

    ngOnDestroy() {
      if (this._userSubscription) this._userSubscription.unsubscribe();
    }
}
