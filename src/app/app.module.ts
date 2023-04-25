import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"; // Needed for Touch functionality of Material Components
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LayoutModule } from "./layout/layout.module";
import { PendingInterceptorModule } from "../@fury/shared/loading-indicator/pending-interceptor.module";
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions,
} from "@angular/material/form-field";
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarConfig,
} from "@angular/material/snack-bar";

// auth guard
import { AuthGuard, LoginAuthGuard } from "./providers/auth/AuthGuard";
import { TokenInterceptor } from "./providers/services/TokenInterceptor";

import { CommonComponentModule } from "./common-component/common-component";
// import { MAT_DATE_FORMATS } from '@angular/material/core';
import { ChangePasswordComponent } from "./pages/change-password/change-password.component";

//import { MY_DATE_FORMATS } from './my-date-format';
// import { MatInputModule } from '@angular/material/input';

import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MomentDateModule } from "@angular/material-moment-adapter";
import { DndDirective } from "./dnd.directive";

@NgModule({
  imports: [
    // Angular Core Module // Don't remove!
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Fury Core Modules
    AppRoutingModule,
    // Layout Module (Sidenav, Toolbar, Quickpanel, Content)
    LayoutModule,
    CommonComponentModule,

    // Displays Loading Bar when a Route Request or HTTP Request is pending
    PendingInterceptorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule,
  ],
  declarations: [
    AppComponent,
    ChangePasswordComponent,
    DndDirective,
  ],
  bootstrap: [AppComponent],
  providers: [
    AuthGuard,
    LoginAuthGuard,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: "fill",
      } as MatFormFieldDefaultOptions,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: "end",
        verticalPosition: "bottom",
      } as MatSnackBarConfig,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
