import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllVendorComponent } from './view-all-vendor/view-all-vendor.component';
import { AddEditVendorComponent } from './add-edit-vendor/add-edit-vendor.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllVendorComponent,
        data: { title: "Vendor" }
    },
    {
        path: 'add',
        component: AddEditVendorComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class VendorRoutingModule {
}


