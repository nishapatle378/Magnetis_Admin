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
import * as timeZones from 'src/app/timezone';

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
  selector: 'add-edit-country',
  templateUrl: './add-edit-country.component.html',
  styleUrls: ['./add-edit-country.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AddEditCountryComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = '';

  BranchList: Array<object> = [];
  RoleList: Array<object> = [];
  GroupList: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filteredBranch: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filteredRole: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filtered_timezone: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditCountryComponent>,
    private fb: FormBuilder, private api: ApiService, private common: CommonService) {
  }

  ngOnInit() {

    this.firstFormGroup = this.fb.group({
      COUNTRY_GUID: [''],
      COUNTRY_NAME: ['', Validators.required],
      CONTINENT: [''],
      CAPITAL: [''],
      IDD_CODE: [''],
      ISO_CODE_2CHAR: [''],
      ISO_CODE_3CHAR: [''],
      TIME_ZONE: [''],
      CREATED_BY: ['SUPER ADMIN'],
      MODIFIED_BY: ['SUPER ADMIN'],
      timezone_Filter:[''],
    });

    if(this.IsEdit){
      this.InsertFormValues();
    }
    this.fetchTimezone();
    

  }

  fetchTimezone(){
    this.filter_List("");
    this.firstFormGroup.controls['timezone_Filter'].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe( (val) => {
          console.log(val)

          this.filter_List(val);
        });  
  }

  protected filter_List(val: any) {
    console.log(val);
    if (!timeZones) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_timezone.next(timeZones);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = timeZones.filter(s => s['text'].toLowerCase().indexOf(search) > -1);
    this.filtered_timezone.next(filter);
  }

  ValidNumberInput(type: string, value: string){
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues(){
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc['COUNTRY_GUID'].setValue(data['COUNTRY_GUID']);
    fc['COUNTRY_NAME'].setValue(data['COUNTRY_NAME']);
    fc['CONTINENT'].setValue(data['CONTINENT']);
    fc['CAPITAL'].setValue(data['CAPITAL']);

    fc['IDD_CODE'].setValue(data['IDD_CODE']);
    fc['ISO_CODE_2CHAR'].setValue(data['ISO_CODE_2CHAR']);

    fc['ISO_CODE_3CHAR'].setValue(data['ISO_CODE_3CHAR']);
    fc['TIME_ZONE'].setValue(data['TIME_ZONE']);
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(new Date(event.value['_d']).toISOString());
  }

  CloseModal(){
    this.dialogRef.close(true);
  }

  SaveCountry(addMore:boolean = false){
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
    this.Save(data, this.IsEdit ? 'country/update' : 'country/insert', addMore);
  }

  // this function is used to save country
  Save(data: object, path: string, addMore:boolean = false){
    console.log(data);
    this.api.PostDataService(path, data).subscribe( (res: object) => {
      this.submit = false;
      if(res['Status'] === 200) {
        if(addMore){
          this.firstFormGroup.reset();
        } else {
          this.dialogRef.close(true);
        }
        this.IsEdit = false;
        this.common.ShowMessage('Country saved successfully', 'notify-success', 3000);
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
