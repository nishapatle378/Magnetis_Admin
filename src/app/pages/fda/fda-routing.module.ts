import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FdaListComponent } from './fda-list/fda-list.component';
import { HistoricalReportsComponent } from './historical-reports/historical-reports.component';
import { PlannerViewComponent } from './planner-view/planner-view.component';

const routes: Routes = [
  {
      path: 'view/all',
      component: FdaListComponent,
      data: { title: "FDAs List" }
  },
  {
      path: 'detail/:id',
      component:PlannerViewComponent ,
      data: { title: "FDA detail" }
  },
  {
      path: 'history-report',
      component: HistoricalReportsComponent,
      data: { title: "FDAs Historical Report" }
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FdaRoutingModule { }
