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

import { CurrencyRoutingModule } from './currency.routing.module';

import { ViewAllCurrencyComponent } from './view-all-currency/view-all-currency.component';
import { AddEditCurrencyComponent } from './add-edit-currency/add-edit-currency.component';

@NgModule({
  imports: [
    CommonModule,
    CurrencyRoutingModule,
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
    ViewAllCurrencyComponent,
    AddEditCurrencyComponent
  ],
  entryComponents: [
    AddEditCurrencyComponent
  ]
})

export class CurrencyModule {
}
