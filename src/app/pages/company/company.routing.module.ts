import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllCompanyComponent } from './view-all-company/view-all-company.component';
import { AddEditCompanyComponent } from './add-edit-company/add-edit-company.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllCompanyComponent,
        data: { title: "Company" }
    },
    {
        path: 'add',
        component: AddEditCompanyComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class CompanyRoutingModule {
}


