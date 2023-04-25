import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FdaRoutingModule } from './fda-routing.module';
import { FdaListComponent } from './fda-list/fda-list.component';
import { HistoricalReportsComponent } from './historical-reports/historical-reports.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { BreadcrumbsModule } from 'src/@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from 'src/@fury/shared/card/card.module';
import { HighlightModule } from 'src/@fury/shared/highlightjs/highlight.module';
import { ListModule } from 'src/@fury/shared/list/list.module';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { SupportLogisticsRoutingModule } from '../support-logistics/support-logistics-routing.module';
import { PlannerViewComponent, AddressSelectionDialog } from './planner-view/planner-view.component';

@NgModule({
  declarations: [
    FdaListComponent,
    HistoricalReportsComponent,
    PlannerViewComponent,
    AddressSelectionDialog
  ],
  imports: [
    CommonModule,
    FdaRoutingModule,
    SupportLogisticsRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ]
})
export class FdaModule { }
