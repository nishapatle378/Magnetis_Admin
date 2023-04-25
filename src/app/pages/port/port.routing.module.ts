import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllPortComponent } from './view-all-port/view-all-port.component';
import { AddEditPortComponent } from './add-edit-port/add-edit-port.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllPortComponent,
        data: { title: "Port" }
    },
    {
        path: 'add',
        component: AddEditPortComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PortRoutingModule {
}


