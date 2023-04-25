import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FollowUpListComponent } from "./follow-up-list/follow-up-list.component";

const routes: Routes = [
  {
    path: "view/all",
    component: FollowUpListComponent,
    data: { title: "Follow-Up" },
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowUpRoutingModule {}
