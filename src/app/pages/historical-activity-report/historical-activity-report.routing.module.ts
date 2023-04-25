import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivityReportListComponent } from './activity-report-list/activity-report-list.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ActivityReportListComponent,
        data: { title: 'Activity Report' }

    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class HistoricalActivityReportRoutingModule {
}


