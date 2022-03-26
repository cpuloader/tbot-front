import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services/auth-guard';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/auth/login.page';
import { ForgotPage } from './pages/auth/forgot.page';
import { SettingsPage } from './pages/settings.page';
import { TradePairsPage } from './pages/trade-pairs.page';
import { LoggingPage } from './pages/logging.page';

const routes: Routes = [
    { path: '',       component: LoginPage },
    { path: 'auth/login',  component: LoginPage },
    { path: 'auth/forgot',  component: ForgotPage },
    { path: 'home',   component: HomePage, canActivate: [AuthGuard] },
    { path: 'settings', component: SettingsPage, canActivate: [AuthGuard] },
    { path: 'trade-pairs', component: TradePairsPage, canActivate: [AuthGuard] },
    { path: 'logs', component: LoggingPage, canActivate: [AuthGuard] },
    { path: '**',     component: LoginPage },
];

@NgModule({
    imports: [ RouterModule.forRoot(routes, {
        useHash: false }) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {}
