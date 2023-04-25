import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { UsersMenuRoutingModule } from './users-menu.routing.module';

import { ViewAllUsersMenuComponent } from './view-all-users-menu/view-all-users-menu.component';
import { AddEditUsersMenuComponent } from './add-edit-users-menu/add-edit-users-menu.component';

@NgModule({
  imports: [
    CommonModule,
    UsersMenuRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ],
  declarations: [
    ViewAllUsersMenuComponent,
    AddEditUsersMenuComponent
  ],
  entryComponents: [
    AddEditUsersMenuComponent
  ]
})

export class UsersMenuModule {
}
