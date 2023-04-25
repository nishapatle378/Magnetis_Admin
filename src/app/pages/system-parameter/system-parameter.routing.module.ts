import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllSystemParameterComponent } from './view-all-system-parameter/view-all-system-parameter.component';
import { AddEditSystemParameterComponent } from './add-edit-system-parameter/add-edit-system-parameter.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllSystemParameterComponent,
        data: { title: "System Parameter" }
    },
    {
        path: 'create',
        component: AddEditSystemParameterComponent,
        data: { title: "Add Item" }
    },
    {
        path: 'edit/:guid',
        component: AddEditSystemParameterComponent,
        data: { title: "Edit Item" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SystemParameterRoutingModule {
}


