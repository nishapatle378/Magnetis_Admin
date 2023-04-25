import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { fadeInRightAnimation } from '../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../@fury/animations/fade-in-up.animation';

// service
import { ApiService } from '../../providers/services/ApiService';

import * as _moment from 'moment';

const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'service-hours',
  templateUrl: './service-hours.component.html',
  styleUrls: ['./service-hours.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ServiceWorkingHours implements OnInit {

  
  Hours: Array<object> = [];

  constructor(
    private dialogRef: MatDialogRef<ServiceWorkingHours>,
    private dialog: MatDialog, private api: ApiService, private snackbar: MatSnackBar) {
  
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    
  }

  AddHours(){
    this.Hours.push({
      day: '',
      startTime: '',
      endTime: '',
      alwaysOn: true,
      weekOff: true,
      enabled: true
    });
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string, index: number) {
    // this.secondFormGroup.controls[time].setValue(new Date(event.value['_d']).toISOString());
  }

  RemoveHours(b: object, i: number){
    this.Hours.splice(i, 1);
  }

  CloseModal(){
    this.dialogRef.close(null);
  }

  Save(){
    this.Hours.forEach((h: object) => {
      if(_moment.isMoment(h['startTime'])){
        h['startTime'] = (new Date(h['startTime']['_d'])).toISOString();
      }
      if(_moment.isMoment(h['endTime'])){
        h['endTime'] = (new Date(h['endTime']['_d'])).toISOString();
      }
    })
    this.dialogRef.close(this.Hours);
  }

}