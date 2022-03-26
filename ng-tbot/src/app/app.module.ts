import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { NgxTweetModule } from "ngx-tweet";

import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth-interceptor';
import { AppRoutingModule } from './app.routes';
import { AuthGuard } from './services/auth-guard';
import { UsersService } from './services/users.service';
import { WindowRef } from './services/window';
import { CookieTools } from './services/cookie-tools.service';
import { ConfigService } from './services/config';
import { HeadersService } from './services/headers.service';

import { AppComponent } from './app.component';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/auth/login.page';
import { ForgotPage } from './pages/auth/forgot.page';
import { SettingsPage } from './pages/settings.page';
import { TradePairsPage } from './pages/trade-pairs.page';
import { LoggingPage } from './pages/logging.page';

import { ToolbarComponent } from './components/toolbar.component';
import { SideMenuComponent } from './components/sidemenu.component';
import { UserSettingsComponent } from './components/user-settings.component';
import { BnnsSettingsComponent } from './components/bnns-settings.component';
import { DialogConfirmComponent } from './components/dialog-confirm.component';
import { TradePairFormComponent } from './components/tp-form.component';
import { TwitterFormComponent } from './components/twit-form.component';
import { TradeSignalComponent } from './components/signal.component';
import { TweetComponent } from './components/tweet.component';
import { PositionsComponent } from './components/positions.component';
import { EmailDataComponent } from './components/emaildata.component';

import { NumbersOnlyInputDirective } from './directives/int-input.directive';
import { DateFieldPipe } from './pipes/date-field.pipe';

@NgModule({
    declarations: [
        AppComponent,
        // directives
        NumbersOnlyInputDirective,
        DateFieldPipe,
        //pages
        HomePage,
        LoginPage,
        ForgotPage,
        SettingsPage,
        TradePairsPage,
        LoggingPage,
        // components
        ToolbarComponent,
        SideMenuComponent,
        UserSettingsComponent,
        BnnsSettingsComponent,
        DialogConfirmComponent,
        TradePairFormComponent,
        TwitterFormComponent,
        TradeSignalComponent,
        TweetComponent,
        PositionsComponent,
        EmailDataComponent
    ],
    entryComponents: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatButtonModule, MatMenuModule, MatListModule, MatGridListModule, MatInputModule,
        MatDialogModule, MatTabsModule, MatCardModule, MatIconModule, MatToolbarModule,
        MatProgressBarModule, MatProgressSpinnerModule, MatSliderModule, MatCheckboxModule,
        MatChipsModule, MatSelectModule, MatExpansionModule, MatSnackBarModule,
        MatSlideToggleModule, MatTableModule, MatButtonToggleModule,
        AppRoutingModule,
        NgxTweetModule
    ],
    providers: [
        CookieService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
