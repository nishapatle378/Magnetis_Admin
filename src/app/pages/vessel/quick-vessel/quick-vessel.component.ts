import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

@Component({
  selector: "fury-quick-vessel",
  templateUrl: "./quick-vessel.component.html",
  styleUrls: ["./quick-vessel.component.scss"],
})
export class QuickVesselComponent implements OnInit {
  firstFormGroup: FormGroup = null;
  CompanyList: Array<object> = [];
  VesselTypeList: Array<object> = [];
  VesselFlagList: Array<object> = [];
  PortList: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filtered_company: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vesselType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vesselFlag: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<QuickVesselComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      VESSEL_GUID: [""],
      COMPANY_GUID: ["", Validators.required],
      company_Filter: [""],
      VESSEL_NAME: ["", Validators.required],
      SHORT_NAME: [""],
      VESSEL_TYPE: ["", Validators.required],
      FLAG_ID: [""],
      IMO_NUMBER: [""],
      Port_Of_Registry: [""],
      Call_Sign: [""],
      Photo_Name: [""],
      EMAIL_ID1: [""],
      EMAIL_ID2: [""],
      PHONE_NO1: [""],
      PHONE_NO2: [""],
      CREATED_BY: ["SUPER ADMIN"],
      MODIFIED_BY: ["SUPER ADMIN"],
      port_Filter: [""],
      vesselFlag_Filter: [""],
      vesselType_Filter: [""],
    });

    this.firstFormGroup.controls["port_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "VESSEL_NAME",
          this.PortList,
          this.filtered_port
        );
      });
    this.firstFormGroup.controls["vesselType_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.VesselTypeList,
          this.filtered_vesselType
        );
      });
    this.firstFormGroup.controls["vesselFlag_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.VesselFlagList,
          this.filtered_vesselFlag
        );
      });
    this.getSysData();
    this.FetchAllCompany();
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
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.VesselTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "GuxFqphkd698108f1-4739-455a-8335-8dda5ca5dadf"
      );
      this.VesselFlagList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "X8yyMpg7p146b9893-21a5-4858-bfda-41cd96e81eef"
      );
    }
    if (this.VesselTypeList) this.filtered_vesselType.next(this.VesselTypeList);
    if (this.VesselFlagList) this.filtered_vesselFlag.next(this.VesselFlagList);
  }
  CloseModal() {
    this.dialogRef.close(true);
  }
  FetchAllCompany() {
    this.api.GetDataService("company/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.CompanyList = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.filtered_company.next(this.CompanyList);
          this.firstFormGroup.controls["company_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.onFilterChange(
                val,
                "COMPANY_NAME",
                this.CompanyList,
                this.filtered_company
              );
            });
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  Save() {
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    this.api.PostDataService("vessel/insert", data).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          this.dialogRef.close(res['Data'].VESSEL_GUID);
          this.common.ShowMessage(
            "Vessel saved successfully",
            "notify-success",
            3000
          );
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
}
