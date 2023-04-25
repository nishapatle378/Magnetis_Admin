import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ListModule } from "../../../@fury/shared/list/list.module";
import { BreadcrumbsModule } from "../../../@fury/shared/breadcrumbs/breadcrumbs.module";
import { FuryCardModule } from "../../../@fury/shared/card/card.module";
import { HighlightModule } from "../../../@fury/shared/highlightjs/highlight.module";
import { MaterialModule } from "../../../@fury/shared/material-components.module";
import { FurySharedModule } from "../../../@fury/fury-shared.module";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { ReportsRoutingModule } from "./reports.routing.module";

import { ViewAllReportsComponent } from "./view-all-reports/view-all-reports.component";
import { SendReportComponent } from "./send-report/send-report.component";
import { VendorInvoiceComponent } from "./vendor-invoice/vendor-invoice.component";
import { VesselScheduleComponent } from "./vessel-schedule/vessel-schedule.component";

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CommonModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule,
  ],
  declarations: [
    ViewAllReportsComponent,
    SendReportComponent,
    VendorInvoiceComponent,
    VesselScheduleComponent,
  ],
  entryComponents: [SendReportComponent],
})
export class ReportsModule {}
