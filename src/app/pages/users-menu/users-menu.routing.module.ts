import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllUsersMenuComponent } from './view-all-users-menu/view-all-users-menu.component';
import { AddEditUsersMenuComponent } from './add-edit-users-menu/add-edit-users-menu.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllUsersMenuComponent
    },
    {
        path: 'add',
        component: AddEditUsersMenuComponent
    },
    
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class UsersMenuRoutingModule {
}


