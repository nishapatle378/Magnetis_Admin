import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular-material-components/moment-adapter";
import {
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NGX_MAT_DATE_FORMATS,
} from "@angular-material-components/datetime-picker";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { ReplaySubject, Subject } from "rxjs";
import { CustomNgxDatetimeAdapter } from "../add-edit-planner/CustomNgxDatetimeAdapter";
import { takeUntil } from "rxjs/operators";
import * as moment from "moment";
const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: "l, LTS",
  },
  display: {
    dateInput: "DD MMM YYYY HH:mm",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "fury-boats-popup",
  templateUrl: "./boats-popup.component.html",
  styleUrls: ["./boats-popup.component.scss"],
  providers: [
    {
      provide: NgxMatDateAdapter,
      useClass: CustomNgxDatetimeAdapter,
      deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class BoatsPopupComponent implements OnInit {
  boatForm: FormGroup;
  EditData = null;
  IsEdit = false;
  ReadOnly = false;
  VesselList: Array<object> = [];
  VendorList: Array<object> = [];
  CurrencyList: Array<object> = [];
  PlannerList: Array<object> = [];
  PlannerServiceList: Array<object> = [];
  Services_GUID = null;
  // defaultBoatDate: Date = new Date();
  isDisabled: Boolean = false;
  public types: Array<object> = [];
  protected _onDestroy = new Subject<void>();
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filtered_from: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_to: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
  Array<object>
>(1);

  public filtered_plannerService: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);

  ErrorMessage = null;
  constructor(
    private dialogRef: MatDialogRef<BoatsPopupComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.boatForm = this.fb.group({
      BoatLog_GUID: [""],
      Vessel_GUID: ["", Validators.required],
      Services_GUID: [""],
      Planner_GUID: ["", Validators.required],
      MEG_REF_NUM: [""],
      Boat_Date: [
        moment().format("DD MMM YYYY HH:mm"),
        [],
        [this.checkValidDate],
      ],
      Boat_Type_GUID: ["", Validators.required],
      Boat_Vendor_GUID: ["", Validators.required],
      Boat_From_GUID: [""],
      Boat_To_GUID: [""],
      Boat_Alongside: [],
      Boat_Cast_Off: [],
      Currency_GUID: [
        "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a",
        Validators.required,
      ],
      Remarks: [""],
      Boat_RATE: [""],
      filtered_service_category: [""],
      service_type_Filter: [""],
      planner_Filter: [""],
      vendor_Filter: [""],
      Trip_Type: ["one-way"],
      FromDate: [""],
    });

    this.fetchBoatType();
    this.loadSelectableData();

    this.boatForm.get("Boat_Vendor_GUID").valueChanges.subscribe((vendor) => {
      let vendorInfo = this.VendorList.find(
        (vendorItem) => vendorItem["Vendor_GUID"] == vendor
      );
      if (vendorInfo) {
        // console.log(vendorInfo);
        this.boatForm
          .get("Currency_GUID")
          .patchValue(vendorInfo["Vendor_Currency"]);
      }
    });
    this.boatForm.get("Boat_Type_GUID").valueChanges.subscribe((boat_type) => {
      if ("o9vJdOkeb86a696fe-3376-4557-aac8-fb36192e76fa" === boat_type) {
        this.isDisabled = true;
      } else {
        this.isDisabled = false;
      }
      let filteredVendor = this.VendorList.filter(
        (vendorItem, i, a) =>
          vendorItem["Boat_Types"] &&
          vendorItem["Boat_Types"].includes(boat_type) &&
          a.findIndex((t) => t["Vendor_GUID"] === vendorItem["Vendor_GUID"]) ==
            i
      );
      console.log(filteredVendor);
      this.filtered_vendor.next(filteredVendor);
    });
    this.boatForm.get("Planner_GUID").valueChanges.subscribe((planner) => {
      let plannerInfo = this.PlannerList.find(
        (plannerItem) => plannerItem["GUID"] == planner
      );
      if (plannerInfo) {
        let VesselList = this.VesselList.filter(
          (vesselItem) =>
            vesselItem["VESSEL_GUID"] == plannerInfo["VESSEL_GUID"]
        );
        if (VesselList) this.filtered_vessel.next(VesselList);
        this.boatForm.get("Vessel_GUID").patchValue(plannerInfo["VESSEL_GUID"]);
      }
    });
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
  formatTime(event) {
    var str = event.target.value;
    str = str.replace(/:/g, "");
    if (str.length === 4) {
      let minut = str.slice(-2);
      let hour = str.slice(0, -2);
      if (minut > 59) {
        minut = `00`;
      }
      if (hour > 23) {
        hour = `00`;
      }
      event.target.value = `${hour}:${minut}`;
    }
    if (str.length === 5) {
      event.target.value = `${str[0]}${str[1]}:${str[2]}${str[3]}`;
    }
  }

  loadSelectableData() {
    const payload = {
      module: ["company", "vendors", "vessels", "planner", "currency"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      if (res["Status"] === 200) {
        if (this.IsEdit && this.Services_GUID) {
          this.loaderLogData();
        }
        this.VesselList = res["Data"].vessels;
        this.CurrencyList = res["Data"].currency;
        this.filtered_currency.next(this.CurrencyList);
        this.VendorList = res["Data"].vendors;
        this.filtered_vendor.next(this.VendorList);
        this.PlannerList = res["Data"].planner;
        this.filtered_planner.next(this.PlannerList);
        this.boatForm.controls["planner_Filter"].valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe((val) => {
            this.onFilterChange(
              val,
              "REF_NUM",
              this.PlannerList,
              this.filtered_planner
            );
          });
        if (this.EditData && this.IsEdit) {
          this.InsertIntoFormValues();
        }
      }
    });
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

  loaderLogData() {
    this.api
      .GetDataService(`boat/get-all?Services_GUID=${this.Services_GUID}`)
      .subscribe(
        (res) => {
          if (res["Status"] === 200) {
            const data = res["Data"][0];
            if (data) {
              var fc: object = this.boatForm.controls;
              fc["BoatLog_GUID"].setValue(data["BoatLog_GUID"]);
              fc["MEG_REF_NUM"].setValue(data["MEG_REF_NUM"]);
              fc["Vessel_GUID"].setValue(data["Vessel_GUID"]);
              fc["Services_GUID"].setValue(data["Services_GUID"]);
              fc["Planner_GUID"].setValue(data["Planner_GUID"]);
              fc["Trip_Type"].setValue(data["Trip_Type"]);

              fc["Boat_Date"].setValue(
                data["Boat_Date"]
                  ? moment(data["Boat_Date"]).format("DD MMM YYYY HH:mm")
                  : ""
              );
              //set defaule boat date
              // this.defaultBoatDate = data["Boat_Date"]
              //   ? new Date(data["Boat_Date"])
              //   : new Date();
              fc["Boat_Type_GUID"].setValue(data["Boat_Type_GUID"]);
              fc["Boat_Vendor_GUID"].setValue(data["Boat_Vendor_GUID"]);
              fc["Boat_From_GUID"].setValue(data["Boat_From_GUID"]);
              fc["Boat_To_GUID"].setValue(data["Boat_To_GUID"]);
              if (data["Boat_Alongside"]) {
                fc["Boat_Alongside"].setValue(
                  moment(data["Boat_Alongside"]).format("HH:mm")
                );
              }

              if (data["Boat_Cast_Off"]) {
                fc["Boat_Cast_Off"].setValue(
                  moment(data["Boat_Cast_Off"]).format("HH:mm")
                );
              }

              fc["Currency_GUID"].setValue(data["Currency_GUID"]);
              fc["Remarks"].setValue(data["Remarks"]);
              fc["Boat_RATE"].setValue(data["Boat_RATE"]);
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
  // fetchAllServiceByPlanner(planner) {
  //   if (planner) {
  //     this.api
  //       .GetDataService(
  //         `planner/service/get-by-plan/${planner}/	fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4`
  //       )
  //       .subscribe(
  //         (res) => {
  //           if (res["Status"] === 200) {
  //             if (res["Status"] === 200) {
  //               this.PlannerServiceList = res["Data"];
  //               if (this.PlannerServiceList) {
  //                 var fc: object = this.boatForm.controls;
  //                 fc["Services_GUID"].setValue(
  //                   this.PlannerServiceList[0]["Services_GUID"]
  //                 );
  //               }
  //             } else {
  //               this.common.ShowMessage(res["message"], "notify-error", 6000);
  //             }
  //           } else {
  //             this.common.ShowMessage(res["message"], "notify-error", 6000);
  //           }
  //         },
  //         (error) => {
  //           this.common.ShowMessage(error["message"], "notify-error", 6000);
  //         }
  //       );
  //   }
  // }

  fetchBoatType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.types = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );
      this.filtered_from.next(
        sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "dSKWQyM3mee96a280-f43b-446c-89bf-049f13139ae8"
        )
      );
      this.filtered_to.next(
        sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "dSKWQyM3mee96a280-f43b-446c-89bf-049f13139ae8"
        )
      );
    }
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

  form: FormGroup;
  CloseModal() {
    this.dialogRef.close(true);
  }

  InsertIntoFormValues() {
    var data = this.EditData;
    var fc: object = this.boatForm.controls;

    fc["BoatLog_GUID"].setValue(data["BoatLog_GUID"]);
    fc["MEG_REF_NUM"].setValue(data["MEG_REF_NUM"]);
    fc["Vessel_GUID"].setValue(data["Vessel_GUID"]);
    fc["Services_GUID"].setValue(data["Services_GUID"]);
    fc["Planner_GUID"].setValue(data["Planner_GUID"]);
    fc["Boat_Date"].setValue(
      data["Boat_Date"]
        ? moment(data["Boat_Date"]).format("DD MMM YYYY HH:mm")
        : ""
    );
    //set defaule boat date
    // this.defaultBoatDate = data["Boat_Date"]
    //   ? new Date(data["Boat_Date"])
    //   : new Date();

    fc["Boat_Type_GUID"].setValue(data["Boat_Type_GUID"]);
    fc["Boat_Vendor_GUID"].setValue(data["Boat_Vendor_GUID"]);
    fc["Boat_From_GUID"].setValue(data["Boat_From_GUID"]);
    fc["Boat_To_GUID"].setValue(data["Boat_To_GUID"]);

    if (data["Boat_Alongside"]) {
      fc["Boat_Alongside"].setValue(
        moment(data["Boat_Alongside"]).format("HH:mm")
      );
    }

    if (data["Boat_Cast_Off"]) {
      fc["Boat_Cast_Off"].setValue(
        moment(data["Boat_Cast_Off"]).format("HH:mm")
      );
    }

    fc["Currency_GUID"].setValue(data["Currency_GUID"]);
    fc["Remarks"].setValue(data["Remarks"]);
    fc["Boat_RATE"].setValue(data["Boat_RATE"]);
  }

  saveBoatLog(addMore = false) {
    this.ErrorMessage = "";
    var data: object = {};
    for (const elem in this.boatForm.value) {
      data[elem] = this.boatForm.value[elem];
    }
    if (data["Boat_Alongside"] && data["Boat_Alongside"].includes(":")) {
      data["Boat_Alongside"] = moment(
        `${moment(moment(data["Boat_Date"], "DD MMM YYYY HH:mm")).format(
          "YYYY-MM-DD"
        )}T${data["Boat_Alongside"]}:00.00Z`
      );
    } else if (data["Boat_Alongside"] && 4 === data["Boat_Alongside"].length) {
      data["Boat_Alongside"] = moment(
        `${moment(moment(data["Boat_Date"], "DD MMM YYYY HH:mm")).format(
          "YYYY-MM-DD"
        )}T${this.insertColon(data["Boat_Alongside"], 2, ":")}:00.00Z`
      );
    }

    if (data["Boat_Cast_Off"] && data["Boat_Cast_Off"].includes(":")) {
      data["Boat_Cast_Off"] = moment(
        `${moment(moment(data["Boat_Date"], "DD MMM YYYY HH:mm")).format(
          "YYYY-MM-DD"
        )}T${data["Boat_Cast_Off"]}:00.00Z`
      );
    } else if (data["Boat_Cast_Off"] && 4 === data["Boat_Cast_Off"].length) {
      data["Boat_Cast_Off"] = moment(
        `${moment(moment(data["Boat_Date"], "DD MMM YYYY HH:mm")).format(
          "YYYY-MM-DD"
        )}T${this.insertColon(data["Boat_Cast_Off"], 2, ":")}:00.00Z`
      );
    }

    if (this.IsEdit) {
      this.update(data, "boat/update", addMore);
    } else {
      this.Save(data, "boat/insert", addMore);
    }
  }
  insertColon(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }
  Save(data: object, path: string, addMore) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Boat log saved successfully",
            "notify-success",
            3000
          );
          if (addMore) {
            this.boatForm.reset();
          } else {
            this.dialogRef.close(true);
          }
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        // this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  update(data: object, path: string, addMore) {
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Boat log updated successfully",
            "notify-success",
            3000
          );
          if (addMore) {
            this.boatForm.reset();
          } else {
            this.dialogRef.close(true);
          }
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
}
