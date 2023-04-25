import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import * as moment from "moment";
import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

@Component({
  selector: "fury-add-new-service",
  templateUrl: "./add-new-service.component.html",
  styleUrls: ["./add-new-service.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AddNewServiceComponent implements OnInit {
  form: FormGroup;
  submit: boolean = false;
  defaultBoatDate = new Date();
  isLinear = true;
  firstFormGroup: FormGroup;

  serviceData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  vendorList: Array<object> = [];
  PlannerList: Array<object> = [];
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
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
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
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      Invoice_Services_GUID: [""],
      Services_GUID: [""],
      Planner_GUID: ["", Validators.required],
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

    this.firstFormGroup
      .get("Service_Type")
      .valueChanges.subscribe((Service_Type) => {
        if (Service_Type) {
          let service = this.serviceTypeList.find(
            (item) =>
              item["PARAMETER_GUID"] === Service_Type
          );
          console.group(service, Service_Type);
          if (service) {
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

            this.firstFormGroup
              .get("Services_Category")
              .setValue(service["PARENT_GUID"]);

            this.filtered_vendor.next(
              this.vendorList.filter(
                (item) => item["SERVICE_GUID"] === Service_Type
              )
            );
          }
        }
      });
    this.firstFormGroup
      .get("Boat_Types")
      .valueChanges.subscribe((Boat_Type) => {
        let filteredVendor = this.vendorList.filter(
          (vendorItem, i, a) =>
            vendorItem["Boat_Types"] &&
            vendorItem["Boat_Types"].includes(Boat_Type) &&
            a.findIndex(
              (t) => t["Vendor_GUID"] === vendorItem["Vendor_GUID"]
            ) == i
        );
        console.log(filteredVendor);
        this.filtered_vendor.next(filteredVendor);
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
        }
      });
    setTimeout(() => {
      this.loadSelectableData();
    }, 2000);
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

  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["currency", "service_vendors", "planner"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          console.log();
          this.vendorList = res["Data"].service_vendors;

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
      this.serviceTypeList = sysData.filter((item) =>
        [
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        ].includes(item["PARENT_GUID"])
      );
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

  saveServiceData() {
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
    this.Save(data, "planner/invoice-service/insert");
  }
  Save(data: object, path: string) {
    console.log(data);
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Service saved successfully",
            "notify-success",
            3000
          );
          this.resetForm();
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
  resetForm() {
    this.firstFormGroup.reset();
    this.firstFormGroup
      .get("Svc_Currency_GUID")
      .patchValue("SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a");
    this.firstFormGroup
      .get("Status_GUID")
      .patchValue("ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943");
    this.firstFormGroup.get("Amount").patchValue(0);
    this.firstFormGroup.get("Svc_Quantity").patchValue(1);
    this.firstFormGroup
      .get("Service_date")
      .patchValue(moment().format("DD MMM YYYY HH:mm"));
  }
}
