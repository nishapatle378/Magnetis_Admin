import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VendorInvoiceComponent } from "./vendor-invoice/vendor-invoice.component";
import { VesselScheduleComponent } from "./vessel-schedule/vessel-schedule.component";

import { ViewAllReportsComponent } from "./view-all-reports/view-all-reports.component";

const routes: Routes = [
  {
    path: "view/all",
    component: ViewAllReportsComponent,
    data: { title: "Planner Activity" },
  },
  {
    path: "vessel-schedule",
    component: VesselScheduleComponent,
    data: { title: "Vessel Schedule" },
  },
  {
    path: "vendor-invoice/report/:plannerId",
    component: VendorInvoiceComponent,
    data: { title: "Vendor Invoice Report" },
  },
  {
    path: "vendor-invoice/report",
    component: VendorInvoiceComponent,
    data: { title: "Vendor Invoice Report" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
