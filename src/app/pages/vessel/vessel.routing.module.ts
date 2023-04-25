import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllVesselComponent } from './view-all-vessel/view-all-vessel.component';
import { AddEditVesselComponent } from './add-edit-vessel/add-edit-vessel.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllVesselComponent,
        data: { title: "Vessel" }
    },
    {
        path: 'add',
        component: AddEditVesselComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class VesselRoutingModule {
}


