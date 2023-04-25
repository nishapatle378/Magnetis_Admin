import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from 'src/app/pages/users/change-password/change-password.component';
import { SmtpSettingComponent } from 'src/app/pages/users/smtp-setting/smtp-setting.component';

@Component({
  selector: 'fury-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  styleUrls: ['./toolbar-user.component.scss']
})
export class ToolbarUserComponent implements OnInit {

  isOpen: boolean;
  user_data: object = {};

  constructor(public router: Router,
    private dialog: MatDialog
    ) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem("AdminData")).user_data;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onClickOutside() {
    this.isOpen = false;
  }

  Logout(){
    localStorage.removeItem('AdminData');
    localStorage.clear();
    // window.location.href = '/login';
    this.router.navigate(['login']);
  }
  gotToChangePassword(){
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '50%',
      maxHeight: '80%',
      disableClose: true
    });
    // dialogRef.componentInstance.UserData = data;
    // dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if(data){
        // this.FetchAllPlanner();
      }
    });
  }

  gotToSMTPSetting(){
    const dialogRef = this.dialog.open(SmtpSettingComponent, {
      width: '50%',
      maxHeight: '80%',
      disableClose: true
    });
    // dialogRef.componentInstance.UserData = data;
    // dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if(data){
        // this.FetchAllPlanner();
      }
    });
  }

}
