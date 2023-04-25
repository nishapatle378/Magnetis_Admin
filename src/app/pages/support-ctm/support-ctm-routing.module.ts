import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HistoricalRecordsComponent } from "./historical-records/historical-records.component";
import { EmailToVendorComponent } from "./email-to-vendor/email-to-vendor.component";
import { CtmIndexComponent } from "./ctm-index/ctm-index.component";
import { AddEditCtmComponent } from "./add-edit-ctm/add-edit-ctm.component";

const routes: Routes = [
  {
    path: "email-to-vendor",
    component: EmailToVendorComponent,
    data: { title: "Send Email" },
  },
  {
    path: "ctm-view-all",
    component: CtmIndexComponent,
    data: { title: "Ctm" },
  },
  {
    path: "ctm-report",
    component: HistoricalRecordsComponent,
    data: { title: "Historical Report" },
  },
  {
    path: "add",
    component: AddEditCtmComponent,
    data: { title: "Add CTM" },
  },
  {
    path: "edit/:id",
    component: AddEditCtmComponent,
    data: { title: "Edit  CTM" },
  },
  {
    path: "edit-service/:service_id",
    component: AddEditCtmComponent,
    data: { title: "Edit  CTM" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportCTMRoutingModule {}
