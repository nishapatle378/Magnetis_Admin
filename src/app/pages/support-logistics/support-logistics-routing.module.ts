import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ViewAllSupportLogisticsComponent } from "./view-all-support-logistics/view-all-support-logistics.component";
import { HistoricalReportsComponent } from "./historical-reports/historical-reports.component";
const routes: Routes = [
  {
    path: "view/all",
    component: ViewAllSupportLogisticsComponent,
    data: { title: "Support Logistics" },
  },
  {
    path: "logistics-report",
    component: HistoricalReportsComponent,
    data: { title: "Historical Reports" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportLogisticsRoutingModule {}
