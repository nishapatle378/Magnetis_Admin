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

import { SystemParameterRoutingModule } from './system-parameter.routing.module';

import { ViewAllSystemParameterComponent } from './view-all-system-parameter/view-all-system-parameter.component';
import { AddEditSystemParameterComponent } from './add-edit-system-parameter/add-edit-system-parameter.component';
import { SysParamSortComponent } from './sys-param-sort/sys-param-sort.component';

@NgModule({
  imports: [
    CommonModule,
    SystemParameterRoutingModule,
    MaterialModule,
    FurySharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ],
  declarations: [
    ViewAllSystemParameterComponent,
    AddEditSystemParameterComponent,
    SysParamSortComponent
  ],
  entryComponents: [
    AddEditSystemParameterComponent
  ]
})

export class SystemParameterModule {
}
