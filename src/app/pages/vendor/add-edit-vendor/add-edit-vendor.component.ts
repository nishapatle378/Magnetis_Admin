import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import { Observable, Subject, ReplaySubject } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";

const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: "L",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "fury-add-edit-vendor",
  templateUrl: "./add-edit-vendor.component.html",
  styleUrls: ["./add-edit-vendor.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddEditVendorComponent implements OnInit {
  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  BranchList: Array<object> = [];
  RoleList: Array<object> = [];
  GroupList: Array<object> = [];

  protected _onDestroy = new Subject<void>();

  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public serviceType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filteredBoatType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  PortList: Array<object> = [];
  CountryList: Array<object> = [];
  CurrencyList: Array<object> = [];
  VesselList: Array<object> = [];
  ServiceList: Array<object> = [];
  isBoat: Boolean = false;
  constructor(
    private dialogRef: MatDialogRef<AddEditVendorComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      Vendor_GUID: [""],
      Vendor_Name: ["", Validators.required],
      Vendor_Service_GUID: ["", Validators.required],
      Boat_Types: [""],
      Vendor_Address: [""],
      Vendor_Port: [
        "1aCoQGO8Aba84e9d4-a0f0-4ad4-8a69-91792dc2b732",
        Validators.required,
      ],
      Vendor_Country: ["70zMONTV2c429b2ab-b401-4849-b1d8-62737b888381"],
      Vendor_Currency: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Vendor_Contact1: [""],
      Vendor_Contact2: [""],
      Handling_Fee: [0],
      EMAIL_ID1: [""],
      EMAIL_ID2: [""],
      PHONE_NO1: [""],
      PHONE_NO2: [""],
      currency_Filter: [""],
      port_Filter: [""],
      service_Filter: [""],
      CREATED_BY: ["SUPER ADMIN"],
      MODIFIED_BY: ["SUPER ADMIN"],
    });

    this.getServiceType();
    this.loadSelectableData();
    this.firstFormGroup.controls["Vendor_Port"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        let selectedPortData = this.PortList.find((s) => s["PORT_GUID"] == val);
        if (selectedPortData) {
          this.firstFormGroup.controls["Vendor_Country"].setValue(
            selectedPortData["Country_GUID"]
          );
          this.firstFormGroup.controls["Vendor_Currency"].setValue(
            selectedPortData["CURRENCY_GUID"]
          );
        }
      });

    this.firstFormGroup.controls["Vendor_Service_GUID"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        if (
          val &&
          val.includes("fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4")
        ) {
          this.isBoat = true;
          let systemParams = JSON.parse(
            localStorage.getItem("systemParamsData")
          );
          const boat_types = systemParams.filter(
            (param) =>
              param["PARENT_GUID"] ==
              "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
          );
          this.firstFormGroup.controls["Boat_Types"].setValidators([
            Validators.required,
          ]);
          this.filteredBoatType.next(boat_types);
        } else {
          this.firstFormGroup.controls["Boat_Types"].clearValidators();
          this.isBoat = false;
        }
        this.firstFormGroup.controls["Boat_Types"].updateValueAndValidity();
      });
    this.firstFormGroup.controls["port_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "Port_Name",
          this.PortList,
          this.filtered_port
        );
      });
    this.firstFormGroup.controls["service_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.ServiceList,
          this.serviceType
        );
      });
    this.firstFormGroup.controls["currency_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "CURRENCY_NAME",
          this.CurrencyList,
          this.filtered_currency
        );
      });

    if (this.IsEdit) {
      this.InsertFormValues();
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

  loadSelectableData() {
    const payload = {
      module: ["company", "currency", "ports", "vendor_services"],
      vendor_id: this.EditData ? this.EditData["Vendor_GUID"] : null,
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      if (res["Status"] === 200) {
        this.CurrencyList = res["Data"].currency;
        this.filtered_currency.next(this.CurrencyList);
        this.PortList = res["Data"].ports;
        this.filtered_port.next(this.PortList);
        if (res["Data"].vendor_services) {
          this.firstFormGroup.controls["Vendor_Service_GUID"].setValue(
            res["Data"].vendor_services.map((item) => item.SERVICE_GUID)
          );
        }
      }
    });
  }
  getServiceType() {
    let systemParams = JSON.parse(localStorage.getItem("systemParamsData"));
    if (systemParams) {
      const serviceCategory = [
        "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
        "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
        "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
      ];
      let serviceSysData = systemParams.filter((param) =>
        serviceCategory.includes(param["PARENT_GUID"])
      );
      this.ServiceList = serviceSysData;
      if (serviceSysData) this.serviceType.next(serviceSysData);
    }
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc["Vendor_GUID"].setValue(data["Vendor_GUID"]);
    fc["Vendor_Name"].setValue(data["Vendor_Name"]);
    fc["Vendor_Service_GUID"].setValue(data["Vendor_Service_GUID"]);
    fc["Vendor_Address"].setValue(data["Vendor_Address"]);

    fc["Vendor_Port"].setValue(data["Vendor_Port"]);
    fc["Boat_Types"].setValue(
      data["Boat_Types"] ? data["Boat_Types"].split(",") : []
    );
    fc["Vendor_Country"].setValue(data["Vendor_Country"]);

    fc["Vendor_Currency"].setValue(data["Vendor_Currency"]);
    fc["Vendor_Contact1"].setValue(data["Vendor_Contact1"]);
    fc["Vendor_Contact2"].setValue(data["Vendor_Contact2"]);
    fc["EMAIL_ID1"].setValue(data["EMAIL_ID1"]);
    fc["EMAIL_ID2"].setValue(data["EMAIL_ID2"]);
    fc["PHONE_NO1"].setValue(data["PHONE_NO1"]);
    fc["PHONE_NO2"].setValue(data["PHONE_NO2"]);
    fc["Handling_Fee"].setValue(data["Handling_Fee"]);
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }

  CloseModal() {
    this.dialogRef.close(true);
  }

  SaveVendor(addNew = false) {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};

    let selectedPort = this.firstFormGroup.controls["Vendor_Port"].value;
    console.log(selectedPort);
    let selectedPortData = this.PortList.find(
      (s) => s["PORT_GUID"] == selectedPort
    );
    console.log(selectedPortData);
    if (selectedPortData) {
      this.firstFormGroup.controls["Vendor_Country"].setValue(
        selectedPortData["Country_GUID"]
      );
      // this.firstFormGroup.controls['Vendor_Currency'].setValue(selectedPortData['CURRENCY_GUID']);
    }
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    if (data["Handling_Fee"] === "" || data["Handling_Fee"] === null) {
      data["Handling_Fee"] = 0;
    }
    this.submit = false;
    if (this.IsEdit) {
      this.update(data, "vendor/update", addNew);
    } else {
      this.Save(data, "vendor/insert", addNew);
    }
  }

  update(data: object, path: string, addNew) {
    console.log(data);
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          if (addNew) {
            this.firstFormGroup.reset();
            this.firstFormGroup.get('Vendor_Port').setValue('1aCoQGO8Aba84e9d4-a0f0-4ad4-8a69-91792dc2b732')
            this.firstFormGroup.get('Vendor_Country').setValue('70zMONTV2c429b2ab-b401-4849-b1d8-62737b888381')
            this.firstFormGroup.get('Vendor_Currency').setValue('SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a')
          } else {
            this.dialogRef.close(true);
          }
          this.common.ShowMessage(
            "Vendor saved successfully",
            "notify-success",
            3000
          );
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }

  // this function is used to save country
  Save(data: object, path: string, addNew) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          if (addNew) {
            this.firstFormGroup.reset();
            this.firstFormGroup.get('Vendor_Port').setValue('1aCoQGO8Aba84e9d4-a0f0-4ad4-8a69-91792dc2b732')
            this.firstFormGroup.get('Vendor_Country').setValue('70zMONTV2c429b2ab-b401-4849-b1d8-62737b888381')
            this.firstFormGroup.get('Vendor_Currency').setValue('SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a')
          } else {
            this.dialogRef.close(true);
          }

          this.common.ShowMessage(
            "Vendor saved successfully",
            "notify-success",
            3000
          );
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
}
