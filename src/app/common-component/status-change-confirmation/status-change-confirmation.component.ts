import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'Confirmation-dialog',
  template: `
    <div mat-dialog-title fxLayout="row" fxLayoutAlign="space-between center">
      <div>{{title}}</div>
      <button type="button" mat-icon-button (click)="close(false)" tabindex="-1">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <p>{{message}}</p>
    </mat-dialog-content>


    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="close(false)">No</button>
      <button mat-raised-button color="primary" (click)="close(true)">Yes</button>
  </mat-dialog-actions>
  `
})
export class StatusChangeConfirmation {
  constructor(private dialogRef: MatDialogRef<StatusChangeConfirmation>) {
  }
  title: string = 'Delete Record!';
  message: string = 'Are you sure want to delete this record ?';

  close(answer: boolean) {
    this.dialogRef.close(answer);
  }
}