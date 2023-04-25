import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
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

import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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
  selector: "fury-agent-screen",
  templateUrl: "./agent-screen.component.html",
  styleUrls: ["./agent-screen.component.scss"],
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
export class AgentScreenComponent implements OnInit {
  static id = 100;

  submit: boolean = false;
  ReadOnly: boolean = false;
  defaultBoatDate = new Date();

  firstFormGroup: FormGroup;
  isTransport = false;
  serviceData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  vendorList: Array<object> = [];
  serviceTypeList: Array<object> = [];
  CurrencyList: Array<object> = [];
  invoiceService: Boolean = false;

  crewHandlingModule = false;
  boatsModule = false;
  protected _onDestroy = new Subject<void>();

  public filtered_service_category: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_service_type: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filteredBoatType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  isBoat = false;
  PlannerList: any;
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  filteredVendor: object[];

  constructor(
    private dialogRef: MatDialogRef<AgentScreenComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      Invoice_Services_GUID: [""],
      Services_GUID: [""],
      Planner_GUID: ["", Validators.required],
      Vessel_Guid: [""],
      Services_Category: ["", Validators.required],
      Service_Type: ["", Validators.required],
      Svc_Quantity: [1, Validators.required],
      Vendor_GUID: ["", Validators.required],
      Invoice_Number: [""],
      Svc_Currency_GUID: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Svc_Amount: [""],
      Amount: [0],
      Boat_Types: [""],
      Vessel_GUID: [""],
      Status_GUID: [
        "ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943",
        Validators.required,
      ],
      Remarks: [""],
      currency_Filter: [""],
      vendor_Filter: [""],
      service_type: [""],
      Service_date: [
        moment().format("DD MMM YYYY HH:mm"),
        [],
        [this.checkValidDate],
      ],
    });

    this.fetchServiceType();
    if (this.isTransport) {
      this.firstFormGroup
        .get("Planner_GUID")
        .valueChanges.subscribe((Planner_GUID) => {
          const plan = this.PlannerList.find((p) => p["GUID"] === Planner_GUID);
          if (plan) {
            this.firstFormGroup.controls["Vessel_Guid"].patchValue(
              plan["VESSEL_GUID"]
            );
          }
        });
    } else if (this.data) {
      this.firstFormGroup.controls["Planner_GUID"].patchValue(this.data.GUID);
      this.firstFormGroup.controls["Vessel_Guid"].patchValue(
        this.data["VESSEL_GUID"]
      );
    }
    this.firstFormGroup
      .get("Service_Type")
      .valueChanges.subscribe((Service_Type) => {
        let service = this.serviceTypeList.find(
          (item) => item["PARAMETER_GUID"] === Service_Type
        );
        if (service) {
          this.firstFormGroup
            .get("Services_Category")
            .setValue(service["PARENT_GUID"]);
          if (
            Service_Type === "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
          ) {
            this.firstFormGroup
              .get("Svc_Currency_GUID")
              .setValue("IQpoC9bW88a501628-f9d8-4e2e-9363-91d2ded8d283");
          } else {
            this.firstFormGroup
              .get("Svc_Currency_GUID")
              .setValue("SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a");
          }
          this.filteredVendor = this.vendorList.filter(
            (item) => item["SERVICE_GUID"] === Service_Type
          );
          this.filtered_vendor.next(this.filteredVendor);
        }
      });
    this.firstFormGroup
      .get("Boat_Types")
      .valueChanges.subscribe((Boat_Type) => {
        this.filteredVendor = this.vendorList.filter(
          (vendorItem, i, a) =>
            vendorItem["Boat_Types"] &&
            vendorItem["Boat_Types"].includes(Boat_Type) &&
            a.findIndex(
              (t) => t["Vendor_GUID"] === vendorItem["Vendor_GUID"]
            ) == i
        );
        console.log(this.filteredVendor);
        this.filtered_vendor.next(this.filteredVendor);
      });
    this.firstFormGroup
      .get("vendor_Filter")
      .valueChanges.subscribe((Vendor) => {
        this.onFilterChange(
          Vendor,
          "Vendor_Name",
          this.filteredVendor,
          this.filtered_vendor
        );
      });
    this.loadSelectableData();

    if (this.IsEdit) {
      this.InsertFormValues();
    }
  }

  handleOnValueChange(data) {
    this.firstFormGroup.get("Service_date").patchValue(new Date(data));
  }
  validateNo(event): boolean {
    var keyCode = event.which ? event.which : event.keyCode;
    var str = event.target.value;
    if (str.length == 0 && event.keyCode == 46) return false;
    if (str.indexOf(".") >= 0 && event.keyCode == 46) return false;
    if (keyCode != 46 && keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
    return true;
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
  checkValidDate(control: AbstractControl) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const monthNames = [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ];
        const date = moment(control.value, "DD MMM YYYY HH:mm");
        console.log(
          "month invalid",
          date.isValid(),
          !monthNames.includes(control.value.substring(3, 6).toUpperCase())
        );
        if (
          (!date.isValid() && control.value !== "") ||
          (!monthNames.includes(control.value.substring(3, 6).toUpperCase()) &&
            control.value !== "")
        ) {
          resolve({ required: true });
        } else {
          resolve(null);
        }
      }, 2000);
    });
  }
  validateDate(event, name):any {
    const value = event.target.value.substring(0, 17);
    if (value.length === 2) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 6) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 11) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 14 && !value.includes(":")) {
      event.target.value = `${value}:`;
      return true;
    }

    event.target.value = value;
  }
  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filteredCategory = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "nrGPrGwmKcb32df55-2fbc-4fc4-aa24-f8d68a5ee6b1"
      );
      const filteredStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "2quoEXxHT1d4cf033-6d84-4f90-a5ec-d8782d44774d"
      );
      if (this.isTransport) {
        this.serviceTypeList = sysData.filter((item) =>
          [
            "llxxUZG9R1cf749e2-ab37-4023-a695-3833b004863a",
            "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
          ].includes(item["PARAMETER_GUID"])
        );
      } else {
        this.serviceTypeList = sysData.filter((item) =>
          [
            "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
            "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
            "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
          ].includes(item["PARENT_GUID"])
        );
      }

      this.filtered_service_type.next(this.serviceTypeList);
      this.filtered_status.next(filteredStatus);
      this.filtered_service_category.next(filteredCategory);
      this.firstFormGroup.controls["service_type"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "PARAMETER_NAME",
            this.serviceTypeList,
            this.filtered_service_type
          );
        });

      this.firstFormGroup.controls["Service_Type"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          if (val === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4") {
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
    }
  }

  // this function is used to search list
  protected currency_filter_List(val: any) {
    if (!this.CurrencyList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search || search === "") {
      this.filtered_currency.next(this.CurrencyList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CurrencyList.filter(
      (s) => s["CURRENCY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_currency.next(filter);
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.serviceData;

    fc["Invoice_Services_GUID"].setValue(
      data["Invoice_Services_GUID"] ? data["Invoice_Services_GUID"] : null
    );
    fc["Invoice_Number"].setValue(data["Invoice_Number"]);
    fc["Services_GUID"].setValue(data["Services_GUID"]);
    fc["Planner_GUID"].setValue(data["Planner_GUID"]);
    fc["Services_Category"].setValue(data["Services_Category"]);
    fc["Service_Type"].setValue(data["Service_Type"]);
    fc["Svc_Quantity"].setValue(data["Svc_Quantity"]);
    fc["Vendor_GUID"].setValue(data["Vendor_GUID"]);
    fc["Service_date"].setValue(
      data["Service_date"]
        ? moment(data["Service_date"]).format("DD MMM YYYY HH:mm")
        : ""
    );

    fc["Svc_Currency_GUID"].setValue(data["Svc_Currency_GUID"]);
    fc["Amount"].setValue(data["Svc_Amount"]);

    fc["Svc_Amount"].setValue(
      this.invoiceService && data["Invoice_Amount"]
        ? data["Invoice_Amount"]
        : data["Svc_Amount"]
    );
    fc["Status_GUID"].setValue(data["Status_GUID"]);
    fc["Remarks"].setValue(data["Remarks"]);
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["currency", "service_vendors"],
    };
    if (this.isTransport) {
      payload.module.push("planner");
      payload["plan_status"] = "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a";
    }
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          console.log();
          this.vendorList = res["Data"].service_vendors;
          this.filteredVendor = this.vendorList;
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
          this.PlannerList = res["Data"].planner;
          this.filtered_planner.next(this.PlannerList);

          if (this.firstFormGroup.get("Service_Type").value) {
            this.filtered_vendor.next(
              this.vendorList.filter(
                (item) =>
                  item["SERVICE_GUID"] ===
                  this.firstFormGroup.get("Service_Type").value
              )
            );
          } else {
            this.filtered_vendor.next(this.vendorList);
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

  saveServiceData(addNew = false) {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    let data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    this.submit = false;
    if (data["Service_date"]) {
      data["Service_date"] = moment(
        data["Service_date"],
        "DD MMM YYYY HH:mm"
      ).toISOString();
    }

    if (this.invoiceService && this.serviceData == null) {
      this.Save(data, "planner/invoice-service/insert", addNew);
    } else {
      if (this.IsEdit) {
        this.update(
          data,
          this.invoiceService
            ? "planner/invoice-service/update"
            : "planner/service/update"
        );
      } else {
        this.Save(
          data,
          this.invoiceService
            ? "planner/invoice-service/insert"
            : "planner/service/insert",
          addNew
        );
      }
    }
  }
  update(data: object, path: string) {
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "Vendor Service updated successfully",
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
  Save(data: object, path: string, addNew) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          if (addNew) {
            var fc: object = this.firstFormGroup.controls;
            fc["Invoice_Services_GUID"].setValue(null);
            fc["Invoice_Number"].setValue("");
            fc["Services_GUID"].setValue("");
            fc["Services_Category"].setValue("");
            fc["Service_Type"].setValue("");
            fc["Svc_Quantity"].setValue(1);
            fc["Vendor_GUID"].setValue("");
            fc["Service_date"].setValue(
              data["Service_date"]
                ? moment(data["Service_date"]).format("DD MMM YYYY HH:mm")
                : ""
            );

            fc["Svc_Currency_GUID"].setValue("");
            fc["Amount"].setValue(0);

            fc["Svc_Amount"].setValue(0);
            fc["Status_GUID"].setValue(
              "ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943"
            );
            fc["Remarks"].setValue("");
          } else {
            this.dialogRef.close(true);
          }
          this.common.ShowMessage(
            "Vendor Service saved successfully",
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

  CloseModal() {
    this.dialogRef.close(true);
  }
  getAllErrors(form: FormGroup | FormArray): { [key: string]: any } | null {
    let hasError = false;
    const result = Object.keys(form.controls).reduce((acc, key) => {
      const control = form.get(key);
      const errors =
        control instanceof FormGroup || control instanceof FormArray
          ? this.getAllErrors(control)
          : control.errors;
      if (errors) {
        acc[key] = errors;
        hasError = true;
      }
      return acc;
    }, {} as { [key: string]: any });
    return hasError ? result : null;
  }
}
