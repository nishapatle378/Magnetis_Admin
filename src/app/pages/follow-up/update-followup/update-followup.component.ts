import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import * as moment from "moment";
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { AgentScreenComponent } from "../../planner/agent-screen/agent-screen.component";
import { BoatsPopupComponent } from "../../planner/boats-popup/boats-popup.component";
import { CrewUpdateComponent } from "../../planner/crew-update/crew-update.component";
import { QuickVesselComponent } from "../../vessel/quick-vessel/quick-vessel.component";

@Component({
  selector: "fury-update-followup",
  templateUrl: "./update-followup.component.html",
  styleUrls: ["./update-followup.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class UpdateFollowupComponent implements OnInit {
  // form: FormGroup;
  Services_Data: object;
  submit: boolean = false;
  defaultBoatDate = new Date();
  isLinear = true;
  firstFormGroup: FormGroup;

  // serviceData: object = null;
  IsEdit: boolean = false;
  // ErrorMessage: string = "";

  vendorList: Array<object> = [];
  VesselList: Array<object> = [];
  PrincipalList: Array<object> = [];
  PlannerList: Array<object> = [];
  serviceTypeList: Array<object> = [];
  CurrencyList: Array<object> = [];
  BoatTypeList: Array<object> = [];
  // invoiceService: Boolean = false;

  // crewHandlingModule = false;
  // boatsModule = false;
  protected _onDestroy = new Subject<void>();

  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filteredPrincipal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filteredVessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  isBoat = false;
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private api: ApiService,
    private router: Router,
    private common: CommonService,
    private dialogRef: MatDialogRef<UpdateFollowupComponent>
  ) {}
  getBoatType(boatTypeId) {
    if (boatTypeId) {
      const boatType = this.BoatTypeList.find(
        (_item) => _item["PARAMETER_GUID"] === boatTypeId
      );
      return boatType ? `(${boatType["PARAMETER_NAME"]})` : "";
    }
    return "";
  }
  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      Folloup_Guid: [],
      Planner_GUID: [""],
      Principal_GUID: [""],
      Vessel_GUID: [""],
      Status_GUID: [
        "ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943",
        Validators.required,
      ],
      Remarks: [""],
      vessel_Filter: [""],
      principal_Filter: [""],
    });
    if (this.IsEdit) {
      this.populateFormValues();
    } else {
      this.loadSelectableData();
      this.firstFormGroup.controls["vessel_Filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "VESSEL_NAME",
            this.VesselList,
            this.filteredVessel
          );
        });
      this.firstFormGroup.controls["principal_Filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "COMPANY_NAME",
            this.PrincipalList,
            this.filteredPrincipal
          );
        });

      this.firstFormGroup
        .get("Planner_GUID")
        .valueChanges.subscribe((Planner_GUID) => {
          const planner = this.PlannerList.find(
            (o) => o["GUID"] === Planner_GUID
          );
          if (planner) {
            this.firstFormGroup
              .get("Vessel_GUID")
              .setValue(planner["VESSEL_GUID"]);
            this.firstFormGroup
              .get("Principal_GUID")
              .setValue(planner["PRINCIPAL_GUID"]);
          }
        });
      this.firstFormGroup
        .get("Principal_GUID")
        .valueChanges.subscribe((Principal_GUID) => {
          const vessel = this.VesselList.filter(
            (_item) => _item["COMPANY_GUID"] === Principal_GUID
          );
          this.filteredVessel.next(vessel);
        });
    }
    this.fetchServiceType();
    const thisVar = this;
    this.firstFormGroup.get("Vessel_GUID").valueChanges.subscribe((vessle) => {
      if (vessle === "ADDVESSEL") {
        const dialogRef = this.dialog.open(QuickVesselComponent, {
          width: "50%",
          maxHeight: "100%",
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.firstFormGroup.get("Vessel_GUID").setValue(data);
            this.updateVesselData(data);
          }
        });
      } else {
        let vesselData = this.VesselList.find(
          (item) => item["VESSEL_GUID"] == vessle
        );
        if (vesselData) {
          thisVar.firstFormGroup
            .get("Principal_GUID")
            .patchValue(vesselData["COMPANY_GUID"]);
          // thisVar.firstFormGroup
          //   .get("VESSEL_TYPE_NAME")
          //   .patchValue(vesselData["VESSEL_TYPE_NAME"]);
          // thisVar.firstFormGroup
          //   .get("VESSEL_COMPANY_NAME")
          //   .patchValue(vesselData["COMPANY_NAME"]);
        }
      }
    });
  
  }
  updateVesselData(vessel_id) {
    const payload = { module: ["vessels"] };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.VesselList = res["Data"].vessels;
          this.filteredVessel.next(this.VesselList);
          let vesselData = this.VesselList.find(
            (item) => item["VESSEL_GUID"] == vessel_id
          );
          if (vesselData) {
            this.firstFormGroup
              .get("Principal_GUID")
              .patchValue(vesselData["COMPANY_GUID"]);
            
          }
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  showSeviceDetail(data){
      if (
        data["Service_Type"] == "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
      ) {
        //Open Crew Modal
        const dialogRef = this.dialog.open(CrewUpdateComponent, {
          width: "70%",
          minHeight: "80%",
          disableClose: true,
        });
        dialogRef.componentInstance.Services_Data = data;
        dialogRef.componentInstance.ReadOnly = true;
        dialogRef.componentInstance.IsEdit = true;
        dialogRef.afterClosed().subscribe((data: any) => {
          
        });
      } else if (
        data["Service_Type"] == "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
      ) {
        //Open Boat Modal
        const dialogRef = this.dialog.open(BoatsPopupComponent, {
          width: "60%",
          minHeight: "80%",
          disableClose: true,
        });
        dialogRef.componentInstance.Services_GUID = data.Services_GUID;
        dialogRef.componentInstance.ReadOnly = true;
        dialogRef.componentInstance.IsEdit = true;
        dialogRef.afterClosed().subscribe((data: any) => {
          
        });
      } else if (
        data["Service_Type"] == "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
      ) {
        this.router.navigate([
          `/support-ctm/edit-service/${data.Services_GUID}`,
          {},
        ]);
      } else {
        const dialogRef = this.dialog.open(AgentScreenComponent, {
          width: "50%",
          maxHeight: "80%",
          minHeight: "80%",
          disableClose: true,
        });
        dialogRef.componentInstance.serviceData = data;
        dialogRef.componentInstance.ReadOnly = true;
        dialogRef.componentInstance.IsEdit = true;
        dialogRef.afterClosed().subscribe((data: any) => {
         
        });
      }
  }
  protected onFilterChange(
    search: any,
    property: string,
    list: Array<any>,
    fiteredList: ReplaySubject<Array<object>>
  ) {
    if (!list) {
      return;
    }
    if (!search) {
      fiteredList.next(list);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = list.filter(
      (s) => s[property].toLowerCase().indexOf(search) > -1
    );
    fiteredList.next(filter);
  }
  populateFormValues() {
    var fc: object = this.firstFormGroup.controls;
    const data = this.Services_Data;
    fc["Folloup_Guid"].setValue(data["Folloup_Guid"]);
    fc["Planner_GUID"].setValue(data["Planner_GUID"]);
    fc["Planner_GUID"].setValue(data["Planner_GUID"]);
    fc["Principal_GUID"].setValue(data["Principal_GUID"]);
    fc["Vessel_GUID"].setValue(data["Vessel_GUID"]);
    fc["Status_GUID"].setValue(data["Status_GUID"]);
    fc["Remarks"].setValue(data["Remarks"]);
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["currency", "service_vendors", "planner", "company", "vessels"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.VesselList = res["Data"].vessels;
          this.filteredVessel.next(this.VesselList);
          this.PrincipalList = res["Data"].company;
          this.filteredPrincipal.next(this.PrincipalList);
          this.PlannerList = res["Data"].planner;
          this.filtered_planner.next(this.PlannerList);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filteredStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "2quoEXxHT1d4cf033-6d84-4f90-a5ec-d8782d44774d"
      );
      this.filtered_status.next(filteredStatus);
      this.BoatTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );
    }
  }

  // ValidNumberInput(type: string, value: string) {
  //   var val = this.common.NumericPattern(value);
  //   this.firstFormGroup.controls[type].setValue(val);
  // }

  saveServiceData() {
    if (this.submit) {
      return;
    }
    this.submit = true;
    let data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }

    this.submit = false;
    this.Save(data, !this.IsEdit ? "followup/insert" : "followup/update");
  }
  Save(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            this.IsEdit
              ? "FollowUp updated successfully"
              : "FollowUp saved successfully",
            "notify-success",
            3000
          );
          this.dialogRef.close(true);
          this.firstFormGroup.reset();
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  resetForm() {
    this.firstFormGroup.reset();
  }
  CloseModal() {
    this.dialogRef.close(true);
  }
}
