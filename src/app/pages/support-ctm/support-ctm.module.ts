import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ListModule } from "../../../@fury/shared/list/list.module";
import { BreadcrumbsModule } from "../../../@fury/shared/breadcrumbs/breadcrumbs.module";
import { FuryCardModule } from "../../../@fury/shared/card/card.module";
import { HighlightModule } from "../../../@fury/shared/highlightjs/highlight.module";
import { MaterialModule } from "../../../@fury/shared/material-components.module";
import { FurySharedModule } from "../../../@fury/fury-shared.module";
import { SupportCTMRoutingModule } from "./support-ctm-routing.module";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { EmailToVendorComponent } from "./email-to-vendor/email-to-vendor.component";
import { HistoricalRecordsComponent } from "./historical-records/historical-records.component";
import { CtmIndexComponent } from "./ctm-index/ctm-index.component";
import { AddEditCtmComponent } from "./add-edit-ctm/add-edit-ctm.component";
import { TransferVesselComponent } from "./transfer-vessel/transfer-vessel.component";
import { QuillModule } from "ngx-quill";

@NgModule({
  declarations: [
    EmailToVendorComponent,
    HistoricalRecordsComponent,
    CtmIndexComponent,
    AddEditCtmComponent,
    TransferVesselComponent,
  ],
  imports: [
    CommonModule,
    SupportCTMRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule,
    QuillModule.forRoot(),
  ],
  entryComponents: [CtmIndexComponent],
})
export class SupportCtmModule {}
