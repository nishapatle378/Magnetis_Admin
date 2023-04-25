import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllCurrencyComponent } from './view-all-currency/view-all-currency.component';
import { AddEditCurrencyComponent } from './add-edit-currency/add-edit-currency.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllCurrencyComponent,
        data: { title: "Currency" }
    },
    {
        path: 'add',
        component: AddEditCurrencyComponent,
        data: { title: "" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class CurrencyRoutingModule {
}


