import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { WindowRef } from './window';

var DEBUG: boolean;

if (environment.production) {
    DEBUG = false;
} else { DEBUG = true; }

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    constructor(private windowRef: WindowRef) {}

    static: string = "/static";
    media: string = "/media";
    debug: boolean = DEBUG;

    defaultProfilePicture: string = this.static + '/def_avatar_pics/default_ava.jpg';
    defaultProfilePicture_prof: string = this.static + '/def_avatar_pics/profile/default_ava_profile.jpg';
    defaultProfilePicture_mini: string = this.static + '/def_avatar_pics/preview/default_ava_preview.jpg';

    // pagination, must be equal in backend
    pageSize: number = 30;

    public getHost(): string {
        return this.windowRef.nativeWindow.location.host;
    }

    public getWSScheme(): string {
        return this.windowRef.nativeWindow.location.protocol == 'https:' ? 'wss:' : 'ws:';
    }

    public getApiUrl(): string {
        //console.log('mode:' + (this.debug ? 'dev' : 'prod'));
        return this.windowRef.nativeWindow.location.protocol + '//' + this.getHost() + '/api/v1';
    }

    public getUserUrl(): string {
        return this.getWSScheme() + '//' + this.getHost() + '/user';
    }


    public checkWindowSize(): string {
        return (this.windowRef.nativeWindow.innerWidth > 400) ? 'side' : 'over';
    }
}
