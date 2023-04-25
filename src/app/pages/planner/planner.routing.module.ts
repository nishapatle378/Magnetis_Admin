import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ViewAllPlannerComponent } from "./view-all-planner/view-all-planner.component";
// import { AddEditPlannerComponent } from "./add-edit-planner/add-edit-planner.component";
// import { BoatsPopupComponent } from "./boats-popup/boats-popup.component";
import { ViewAllBoatLogComponent } from "./view-all-boat-log/view-all-boat-log.component";
import { ViewAllCrewHandelingComponent } from "./view-all-crew-handeling/view-all-crew-handeling.component";
import { PlannerDetailsComponent } from "./planner-details/planner-details.component";
import { AddNewServiceComponent } from "./add-new-service/add-new-service.component";
import { TransportIndexComponent } from "./transport-index/transport-index.component";

const routes: Routes = [
  {
    path: "view/all",
    component: ViewAllPlannerComponent,
    data: { title: "Planner" },
  },
  {
    path: "service/:id",
    component: PlannerDetailsComponent,
    data: { title: "Planner Services" },
  },
  // {
  //   path: "add",
  //   component: AddEditPlannerComponent,
  //   data: { title: "Add Planner" },
  // },
  {
    path: "add-service",
    component: AddNewServiceComponent,
    data: { title: "Add Service" },
  },
  {
    path: "transport/all",
    component: TransportIndexComponent,
    data: { title: "Transport Log" },
  },
  {
    path: "boat-log/all",
    component: ViewAllBoatLogComponent,
    data: { title: "Boat Log" },
  },
  {
    path: "crew-log/all",
    component: ViewAllCrewHandelingComponent,
    data: { title: "Crew Handling" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlannerRoutingModule {}
