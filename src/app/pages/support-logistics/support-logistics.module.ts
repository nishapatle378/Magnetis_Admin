import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ListModule } from "../../../@fury/shared/list/list.module";
import { BreadcrumbsModule } from "../../../@fury/shared/breadcrumbs/breadcrumbs.module";
import { FuryCardModule } from "../../../@fury/shared/card/card.module";
import { HighlightModule } from "../../../@fury/shared/highlightjs/highlight.module";
import { MaterialModule } from "../../../@fury/shared/material-components.module";
import { FurySharedModule } from "../../../@fury/fury-shared.module";
import { SupportLogisticsRoutingModule } from "./support-logistics-routing.module";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ViewAllSupportLogisticsComponent, UpdateBulkStatusDialog } from "./view-all-support-logistics/view-all-support-logistics.component";
import { AddEditSupportLogisticsComponent } from "./add-edit-support-logistics/add-edit-support-logistics.component";
import { HistoricalReportsComponent } from "./historical-reports/historical-reports.component";
import { UpdateDeliveryComponent } from './update-delivery/update-delivery.component';
import { UpdateOutgoingAwbComponent } from './update-outgoing-awb/update-outgoing-awb.component';

@NgModule({
  declarations: [
    ViewAllSupportLogisticsComponent,
    AddEditSupportLogisticsComponent,
    HistoricalReportsComponent,
    UpdateDeliveryComponent,
    UpdateOutgoingAwbComponent,
    UpdateBulkStatusDialog
  ],
  imports: [
    CommonModule,
    SupportLogisticsRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule,
  ],
  entryComponents: [AddEditSupportLogisticsComponent],
})
export class SupportLogisticsModule {}
