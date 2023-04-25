import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { UsersRoutingModule } from './users.routing.module';

import { ViewAllUsersComponent } from './view-all-users/view-all-users.component';
import { AddEditUsersComponent } from './add-edit-users/add-edit-users.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SmtpSettingComponent } from './smtp-setting/smtp-setting.component';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ],
  declarations: [
    ViewAllUsersComponent,
    AddEditUsersComponent,
    ChangePasswordComponent,
    SmtpSettingComponent
  ],
  entryComponents: [
    AddEditUsersComponent
  ]
})

export class UsersModule {
}
