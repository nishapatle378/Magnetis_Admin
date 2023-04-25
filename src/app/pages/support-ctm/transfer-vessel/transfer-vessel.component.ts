import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'fury-transfer-vessel',
  templateUrl: './transfer-vessel.component.html',
  styleUrls: ['./transfer-vessel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransferVesselComponent implements OnInit {
  protected _onDestroy = new Subject<void>();
  form: FormGroup;
  PlannerList = [];
  ErrorMessage = null;
  submit: boolean = false;
  IsEdit = false;
  EditData = null;
  newCTMNumber = null;
  selectedPlannerDetails = null;
  constructor(
    private dialogRef: MatDialogRef<TransferVesselComponent>,
    private fb: FormBuilder, private api: ApiService, private common: CommonService
  ) { }
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<Array<object>>(1);

  ngOnInit(): void {
    const thisVar = this;
    this.form = this.fb.group({
      CTM_GUID: [''],
      Vessel_GUID :[''],
      Planner_GUID: [''],
      Vessel_Name: [''],
      Port_GUID: [''],
      Port_Name: [''],
      CTM_REF: [''],
    });
    this.form.get('Planner_GUID').valueChanges.subscribe(plannerValue => {
      let selectedPlanner = this.PlannerList.find(planner => planner['GUID'] == plannerValue);
      if(selectedPlanner){
        this.selectedPlannerDetails = selectedPlanner;
        this.form.get('Vessel_GUID').setValue(selectedPlanner['VESSEL_GUID']);
        this.form.get('Port_GUID').setValue(selectedPlanner['PORT_GUID']);
        this.form.get('Vessel_Name').setValue(selectedPlanner['VESSEL_NAME']);
        this.form.get('Port_Name').setValue(selectedPlanner['Port_Name']);
      }
      this.form.get('CTM_GUID').patchValue(this.EditData['CTM_GUID']);
    });
    this.fetchAllPlanner();
    setTimeout(function(){
      thisVar.api.GetDataService('common/get-ref?s=TBL_DTL_SUPPORT_CTM').subscribe( res => {
      if(res['Status'] == 200){
        thisVar.form.get('CTM_REF').patchValue(res['Data'].ref_number);
      }

    })
  }, 500);
  }

  fetchAllPlanner(){
    console.log('fetching all planner');
    this.api.GetDataService('planner/all').subscribe( res => {
      if(res['Status'] === 200){
        if(this.EditData)
          this.PlannerList = res['Data'].filter((u: object) => u['ACTIVE_STATUS'] && u['Planner_GUID'] != this.EditData['Planner_GUID']);
        else 
          this.PlannerList = res['Data'].filter((u: object) => u['ACTIVE_STATUS']);  
        this.filtered_planner.next(this.PlannerList);
      }else{
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }
  CloseModal(){
    this.dialogRef.close(true);
  }
  passData = null;
  TransferToVessel(){

    var data: object = {};
    for(const elem in this.form.value){
      data[elem] = this.form.value[elem];
    }
    data['Status_Completed'] = '8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c';
    data['Status_Inprogress'] = 'EeqmCauXUae3fe5b8-e6cf-4b90-a562-f526e4521662';
    this.passData = data;
    this.api.PostDataService('support-ctm/transfer', data).subscribe( res => {
      if(res['Status'] === 200){
        console.log(res);
        this.dialogRef.close(this.passData);
      }else{
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }

}
