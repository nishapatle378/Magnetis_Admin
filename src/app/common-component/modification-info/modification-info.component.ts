import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'modification-info-dialog',
  template: `
    <div mat-dialog-title fxLayout="row" fxLayoutAlign="space-between center">
      <div>Modification Info</div>
      <button type="button" mat-icon-button (click)="close(false)" tabindex="-1">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <p>Created By - {{UserData.CREATED_BY}}</p>
      <p>Created Date - {{DATE_CREATED}}</p>
      <p>Modified By - {{UserData.MODIFIED_BY}}</p>
      <p>Modified Date - {{DATE_MODIFIED}}</p>
    </mat-dialog-content>


    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="close(true)">Close</button>
  </mat-dialog-actions>
  `
})
export class ModificationInfoComponent implements OnInit {

  UserData: any = {};
  DATE_CREATED: string = '';
  DATE_MODIFIED: string = '';

  constructor(private dialogRef: MatDialogRef<ModificationInfoComponent>) {
    
  }

  ngOnInit(){

    var dt = new Date(this.UserData['DATE_CREATED']);
    this.DATE_CREATED = `${dt.getDate()}/${(dt.getMonth() + 1) > 9 ? (dt.getMonth() + 1) : '0'+(dt.getMonth() + 1)}/${dt.getFullYear()}`;

    if(this.UserData['DATE_MODIFIED']){
      var md = new Date(this.UserData['DATE_MODIFIED']);
      this.DATE_MODIFIED = `${md.getDate()}/${(md.getMonth() + 1) > 9 ? (md.getMonth() + 1) : '0'+(md.getMonth() + 1)}/${md.getFullYear()}`;
    }
    
  }

  close(answer: boolean) {
    this.dialogRef.close(answer);
  }
}