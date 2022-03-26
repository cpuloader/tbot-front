import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ConfigService } from './config';

@Injectable({
  providedIn: 'root'
})
export class CookieTools {
    constructor(private cookieService: CookieService, private config: ConfigService) {}

    setAuthorization(token: string) {
      let expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 1);  // set cookies for 1 hour - test
      this.cookieService.set('Authorization', token, expireDate);//, '/',
                             //this.config.getHost(), false, 'Lax');
    }

    cleanAll() {
      this.cookieService.delete('Authorization');
    }
}
