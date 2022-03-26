import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../objects/objects';
import { ConfigService } from './config';
import { CookieTools } from './cookie-tools.service';
import { HeadersService } from './headers.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private userObj: User | null = null;
    private apiUrl: string;

    constructor(private httpClient: HttpClient,
                private router: Router,
                private config: ConfigService,
                private headers: HeadersService,
                private cookieTools: CookieTools) {

        this.apiUrl = this.config.getApiUrl();
    }

    private _userUpdated$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    public set userUpdated(user: User | null) {
        this.userObj = user;
        this._userUpdated$.next(user);
    }
    public get userUpdated$(): Observable<User | null> {
        return this._userUpdated$.asObservable();
    }

    public getLoggedUser(): User | null {
        return this.userObj;
    }

    public checkLoggedUser(): User | null {
        const ustr = localStorage.getItem('loggedUser');
        const user = ustr ? JSON.parse(ustr) : null;
        this.userUpdated = user;
        return user;
    }

    public login(email: string, password: string): Observable<any> {
        const url: string = `${this.apiUrl}/auth/login/`;
        return this.httpClient.post<User>(url, {
            email: email.toLowerCase(),
            password: password
        }, { headers: this.headers.makeCSRFHeader() }).pipe(
            map(user => {
                    this._saveMeToStorage(user);
                    this.userUpdated = user;
                    this.router.navigate(['/home']);
                },
                (error: any) => error
            )
        );
    }

    public signup(user: User): Observable<any> {
        const url = `${this.apiUrl}/register`;
        return this.httpClient.post(url, user, { headers: this.headers.makeCSRFHeader() })
          .pipe(
              map(res => this.router.navigate(['/auth/login']) )
          );
    }

    public forgotEmail(email: string): Observable<any> {
        const url = `${this.apiUrl}/forgot?email=${email}`;
        return this.httpClient.get(url)
    }

    public logout(): Observable<any> {
        const url: string = `${this.apiUrl}/auth/logout/`;
        return this.httpClient.post(url, {}, { headers: this.headers.makeCSRFHeader() })
          .pipe(
              map(res => this.afterLogout(res) )
          ).pipe(
              catchError(err => this.afterLogout(err) ) // clean all in any case
          );
    }

    public getMeByHttp(): Observable<User> {
        const url = `${this.apiUrl}/accounts/${this.userObj?.id}/`
        return this.httpClient.get<User>(url);
    }

    public updateUser(user: User): Observable<User> {
        const url = `${this.apiUrl}/accounts/${user.id}/`;
        let proxyUser = JSON.parse(JSON.stringify(user)); //make copy to not change view
        delete proxyUser.avatarimage;                // we save picture in another way
        return this.httpClient
            .put<User>(url, proxyUser, { headers: this.headers.makeCSRFHeader() }).pipe(
                map((res: User) => this._updateSuccess(res),
                    (error: any) => error)
              );
    }

    public getMe(): User | null {
        const userStr: string | null = localStorage.getItem('loggedUser');
        const usr: User | null = userStr ? JSON.parse(userStr) : null;
        //console.log('user from storage', usr);
        return usr;
    }

    public isAuthorized(): boolean {
        return !!localStorage.getItem('loggedUser');
    }

    unauthenticate(): void {
        this.userObj = null;
        localStorage.clear();
    }

    public afterLogout(res: any): any {
        localStorage.clear();
        this.cookieTools.cleanAll();
        this.userObj = null;
        this._userUpdated$.next(null);
        this.router.navigate(['/auth/login']);
        return res;
    }

    private _updateSuccess(user: User): User {
        this._saveMeToStorage(user);
        this._userUpdated$.next(user);
        return user;
    }

    private _saveMeToStorage(user: User) {
        localStorage.setItem('loggedUser', JSON.stringify(user));
    }
}
