import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllCountryComponent } from './view-all-country/view-all-country.component';
import { AddEditCountryComponent } from './add-edit-country/add-edit-country.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllCountryComponent,
        data: { title: "Country" }
    },
    {
        path: 'add',
        component: AddEditCountryComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class CountryRoutingModule {
}


