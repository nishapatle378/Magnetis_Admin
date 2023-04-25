import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';

import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import { Observable, Subject, ReplaySubject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

// service
import { ApiService } from '../../../providers/services/ApiService';
import { CommonService } from '../../../providers/services/CommonService';

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
  selector: 'send-report',
  templateUrl: './send-report.component.html',
  styleUrls: ['./send-report.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class SendReportComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  UserData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = '';

  PortList: Array<object> = [];
  VesselList: Array<object> = [];
  table: any = '';
  num: number;

  protected _onDestroy = new Subject<void>();
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);

  constructor(
    private dialogRef: MatDialogRef<SendReportComponent>,
    private fb: FormBuilder, private api: ApiService, private common: CommonService) {
  }

  ngOnInit() {

    this.firstFormGroup = this.fb.group({
      to: ['', Validators.required],
      cc : [''],
      subject: ['', Validators.required],
      body: ['', Validators.required],
    });
    
    if(this.IsEdit){
      this.InsertFormValues();
    }

  }

  ValidNumberInput(type: string, value: string){
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues(){
    
  }

  CloseModal(){
    this.dialogRef.close(null);
  }

  Save(){
    this.ErrorMessage = '';
    if(this.submit){
      return;
    }
    this.submit = true;
    var data: object = {};
    for(const elem in this.firstFormGroup.value){
      data[elem] = this.firstFormGroup.value[elem];
    }
  
    this.submit = false;
    data['table'] = this.table;
    data['num'] = this.num;
    this.SavePlanner(data, 'planner/send-reports');
  }

  // this function is used to save planner
  SavePlanner(data: object, path: string){
    this.api.PostDataService(path, data).subscribe( (res: object) => {
      this.submit = false;
      if(res['Status'] === 200) {
        this.dialogRef.close(true);
        this.common.ShowMessage('Report sended successfully', 'notify-success', 3000);
      } else{
        // this.ErrorMessage = res['message'];
        this.common.ShowMessage(res['Message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.submit = false;
      this.common.ShowMessage(error['Message'], 'notify-error', 6000);
    })
  }

}
