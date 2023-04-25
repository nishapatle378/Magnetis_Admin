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

import { CompanyRoutingModule } from './company.routing.module';

import { ViewAllCompanyComponent } from './view-all-company/view-all-company.component';
import { AddEditCompanyComponent } from './add-edit-company/add-edit-company.component';

@NgModule({
  imports: [
    CommonModule,
    CompanyRoutingModule,
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
    ViewAllCompanyComponent,
    AddEditCompanyComponent
  ],
  entryComponents: [
    AddEditCompanyComponent
  ]
})

export class CompanyModule {
}
