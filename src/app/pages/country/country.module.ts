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

import { CountryRoutingModule } from './country.routing.module';

import { ViewAllCountryComponent } from './view-all-country/view-all-country.component';
import { AddEditCountryComponent } from './add-edit-country/add-edit-country.component';

@NgModule({
  imports: [
    CommonModule,
    CountryRoutingModule,
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
    ViewAllCountryComponent,
    AddEditCountryComponent
  ],
  entryComponents: [
    AddEditCountryComponent
  ]
})

export class CountryModule {
}
