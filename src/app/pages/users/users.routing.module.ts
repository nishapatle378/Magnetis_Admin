import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ViewAllUsersComponent } from './view-all-users/view-all-users.component';
import { AddEditUsersComponent } from './add-edit-users/add-edit-users.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
    {
        path: 'view/all',
        component: ViewAllUsersComponent,
        data: { title: "Users" }
    },
    {
        path: 'add',
        component: AddEditUsersComponent,
        data: { title: "" }
    },
    {
        path: 'change-password',
        component: ChangePasswordComponent,
        data: { title: "Change Password" }
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class UsersRoutingModule {
}


