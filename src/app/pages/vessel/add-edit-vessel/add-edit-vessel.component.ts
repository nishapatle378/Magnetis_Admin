import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
  selector: 'add-edit-vessel',
  templateUrl: './add-edit-vessel.component.html',
  styleUrls: ['./add-edit-vessel.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None
})
export class AddEditVesselComponent implements OnInit {

  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = '';

  CompanyList: Array<object> = [];
  VesselTypeList: Array<object> = [];
  VesselFlagList: Array<object> = [];
  PortList: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filtered_company: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filtered_vesselType: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filtered_vesselFlag: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditVesselComponent>,
    private fb: FormBuilder, private api: ApiService, private common: CommonService) {
  }

  ngOnInit() {

    this.firstFormGroup = this.fb.group({
      VESSEL_GUID: [''],
      COMPANY_GUID: ['', Validators.required],
      company_Filter: [''],
      VESSEL_NAME: ['', Validators.required],
      SHORT_NAME: [''],
      VESSEL_TYPE: ['', Validators.required],
      FLAG_ID: [''],
      IMO_NUMBER: [''],
      Port_Of_Registry: ['', Validators.required],
      Call_Sign: [''],
      Photo_Name: ['photo.jpeg'],
      EMAIL_ID1: [''],
      EMAIL_ID2: [''],
      PHONE_NO1: [''],
      PHONE_NO2: [''],
      CREATED_BY: ['SUPER ADMIN'],
      MODIFIED_BY: ['SUPER ADMIN'],
      port_Filter: [''],
      vesselFlag_Filter: [''],
      vesselType_Filter: [''],
    });
    this.FetchAllCompany();
    this.getSysData();
    let thisVar = this;
    setTimeout(function () {
      thisVar.FetchAllPort();
    }, 500);
    this.firstFormGroup.controls['port_Filter'].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_PortList(val);
      });
    this.firstFormGroup.controls['vesselType_Filter'].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_VesselTypeList(val);
      });
    this.firstFormGroup.controls['vesselFlag_Filter'].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_VesselFlagList(val);
      });
    if (this.IsEdit) {
      this.InsertFomrValues();
    }

  }

  getSysData() {
    let sysData = JSON.parse(localStorage.getItem('systemParamsData'));
    if (sysData) {
      this.VesselTypeList = sysData.filter(item => item['PARENT_GUID'] == 'GuxFqphkd698108f1-4739-455a-8335-8dda5ca5dadf');
      this.VesselFlagList = sysData.filter(item => item['PARENT_GUID'] == 'X8yyMpg7p146b9893-21a5-4858-bfda-41cd96e81eef');
    }
    if (this.VesselTypeList)
      this.filtered_vesselType.next(this.VesselTypeList);
    if (this.VesselFlagList)
      this.filtered_vesselFlag.next(this.VesselFlagList);
  }

  FetchAllPort() {
    this.api.GetDataService('port/all').subscribe(res => {
      if (res['Status'] === 200) {
        //this.FetchAllVessel();
        // this.PortList = res['Data'];
        this.PortList = res['Data'].filter((u: object) => u['ACTIVE_STATUS']);
        this.filtered_port.next(this.PortList);

      } else {
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }

  protected filter_PortList(val: any) {
    if (!this.PortList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_port.next(this.PortList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.PortList.filter(s => s['Port_Name'].toLowerCase().indexOf(search) > -1);
    this.filtered_port.next(filter);
  }

  protected filter_VesselFlagList(val: any) {
    if (!this.VesselFlagList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_vesselFlag.next(this.VesselFlagList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.VesselFlagList.filter(s => s['PARAMETER_NAME'].toLowerCase().indexOf(search) > -1);
    this.filtered_vesselFlag.next(filter);
  }

  protected filter_VesselTypeList(val: any) {
    if (!this.VesselTypeList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_vesselType.next(this.VesselTypeList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.VesselTypeList.filter(s => s['PARAMETER_NAME'].toLowerCase().indexOf(search) > -1);
    this.filtered_vesselType.next(filter);
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFomrValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc['VESSEL_GUID'].setValue(data['VESSEL_GUID']);
    fc['COMPANY_GUID'].setValue(data['COMPANY_GUID']);
    fc['VESSEL_NAME'].setValue(data['VESSEL_NAME']);
    fc['SHORT_NAME'].setValue(data['SHORT_NAME']);
    fc['VESSEL_TYPE'].setValue(data['VESSEL_TYPE']);

    fc['FLAG_ID'].setValue(data['FLAG_ID']);
    fc['IMO_NUMBER'].setValue(data['IMO_NUMBER']);

    fc['Port_Of_Registry'].setValue(data['Port_Of_Registry']);
    fc['Call_Sign'].setValue(data['Call_Sign']);
    fc['Photo_Name'].setValue(data['Photo_Name']);

    fc['EMAIL_ID1'].setValue(data['EMAIL_ID1']);
    fc['EMAIL_ID2'].setValue(data['EMAIL_ID2']);

    fc['PHONE_NO1'].setValue(data['PHONE_NO1']);
    fc['PHONE_NO2'].setValue(data['PHONE_NO2']);

  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(new Date(event.value['_d']).toISOString());
  }

  FetchAllCompany() {
    this.api.GetDataService('company/all').subscribe(res => {
      if (res['Status'] === 200) {
        this.CompanyList = res['Data'].filter((u: object) => u['ACTIVE_STATUS']);
        this.filtered_company.next(this.CompanyList);
        this.firstFormGroup.controls['company_Filter'].valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe((val) => {
            this.filter_List(val);
          });
      } else {
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }


  // this function is used to search list
  protected filter_List(val: any) {
    if (!this.CompanyList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_company.next(this.CompanyList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CompanyList.filter(s => s['COMPANY_NAME'].toLowerCase().indexOf(search) > -1);
    this.filtered_company.next(filter);
  }

  CloseModal() {
    this.dialogRef.close(true);
  }

  SaveCompany(addMore: boolean = false) {
    this.ErrorMessage = '';
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }

    this.submit = false;
    this.Save(data, this.IsEdit ? 'vessel/update' : 'vessel/insert', addMore);
  }

  // this function is used to save company
  Save(data: object, path: string, addMore: boolean = false) {
    this.api.PostDataService(path, data).subscribe((res: object) => {
      this.submit = false;
      if (res['Status'] === 200) {
        if (addMore) {
          this.firstFormGroup.reset();
          this.IsEdit = false;
        } else {
          this.dialogRef.close(true);
        }
        this.common.ShowMessage('Vessel saved successfully', 'notify-success', 3000);
      } else {
        // this.ErrorMessage = res['message'];
        this.common.ShowMessage(res['Message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.submit = false;
      this.common.ShowMessage(error['Message'], 'notify-error', 6000);
    })
  }

}
