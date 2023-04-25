import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { CustomNgxDatetimeAdapter } from "./CustomNgxDatetimeAdapter";
import { NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular-material-components/moment-adapter";

import { Subject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";
import { MAT_DATE_LOCALE } from "@angular/material/core";

import * as _moment from "moment";
import {
  NgxMatDateAdapter,
  NgxMatDateFormats,
  NGX_MAT_DATE_FORMATS,
} from "@angular-material-components/datetime-picker";
import { QuickVesselComponent } from "../../vessel/quick-vessel/quick-vessel.component";
import * as moment from "moment";
import { Title } from "@angular/platform-browser";

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
  selector: "fury-add-edit-planner",
  templateUrl: "./add-edit-planner.component.html",
  styleUrls: ["./add-edit-planner.component.scss"],
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
export class AddEditPlannerComponent implements OnInit {
  static id = 100;

  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  UserData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  PortList: Array<object> = [];
  VesselList: Array<object> = [];
  PicList: Array<object> = [];
  CurrencyList: Array<object> = [];
  AppointmentList: Array<object> = [];
  NewRefNumber = "";
  protected _onDestroy = new Subject<void>();
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_appointment: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditPlannerComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    let thisVar = this;
    this.firstFormGroup = this.fb.group({
      GUID: [""],
      REF_NUM: ["", Validators.required],
      PORT_GUID: [
        "1aCoQGO8Aba84e9d4-a0f0-4ad4-8a69-91792dc2b732",
        Validators.required,
      ],
      PRINCIPAL_GUID: ["1"],
      CURRENCY_GUID: ["1"],
      VESSEL_GUID: ["", Validators.required],
      APPOINTMENT_GUID: ["", Validators.required],
      APPOINTMENT_REF: [""],
      VESSEL_ETA: ["", [], [this.checkValidDate]],
      VESSEL_ETD: ["", [], [this.checkValidDate]],
      VESSEL_ACTUAL_ARR: ["", [], [this.checkValidDate]],
      VESSEL_ACTUAL_DEP: ["", [], [this.checkValidDate]],
      AGENT_GUID: [""],
      PLAN_STATUS_GUID: ["ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a"],
      Remarks: [""],
      port_Filter: [""],
      vessel_Filter: [""],
      pic_Filter: [""],
      currency_Filter: [""],
      appintment_Filter: [""],
      VESSEL_TYPE_NAME: [""],
      VESSEL_COMPANY_NAME: [""],
      Agency_Fee: [""],
      CTM_Amount: [""],
      Crew_Change: [""],
    });
    this.getSysData();
    this.loadSelectableData();
    if (this.IsEdit) {
      this.InsertFormValues();
    } else {
    }

    this.firstFormGroup.controls["appintment_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_AppointmentList(val);
      });
    this.firstFormGroup.controls["pic_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_PicList(val);
      });
    this.firstFormGroup.get("VESSEL_GUID").valueChanges.subscribe((vessle) => {
      if (vessle === "ADDVESSEL") {
        const dialogRef = this.dialog.open(QuickVesselComponent, {
          width: "50%",
          maxHeight: "100%",
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.firstFormGroup.get("VESSEL_GUID").setValue(data);
            this.updateVesselData(data);
          }
        });
      } else {
        let vesselData = this.VesselList.find(
          (item) => item["VESSEL_GUID"] == vessle
        );
        if (vesselData) {
          thisVar.firstFormGroup
            .get("PRINCIPAL_GUID")
            .patchValue(vesselData["COMPANY_GUID"]);
          thisVar.firstFormGroup
            .get("VESSEL_TYPE_NAME")
            .patchValue(vesselData["VESSEL_TYPE_NAME"]);
          thisVar.firstFormGroup
            .get("VESSEL_COMPANY_NAME")
            .patchValue(vesselData["COMPANY_NAME"]);
        }
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
  updateVesselData(vessel_id) {
    const payload = { module: ["vessels"] };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.VesselList = res["Data"].vessels;
          this.filtered_vessel.next(this.VesselList);
          let vesselData = this.VesselList.find(
            (item) => item["VESSEL_GUID"] == vessel_id
          );
          if (vesselData) {
            this.firstFormGroup
              .get("PRINCIPAL_GUID")
              .patchValue(vesselData["COMPANY_GUID"]);
            this.firstFormGroup
              .get("VESSEL_TYPE_NAME")
              .patchValue(vesselData["VESSEL_TYPE_NAME"]);
            this.firstFormGroup
              .get("VESSEL_COMPANY_NAME")
              .patchValue(vesselData["COMPANY_NAME"]);
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
  loadSelectableData() {
    //PostDataService
    const payload = { module: ["currency", "users", "ports", "vessels"] };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);

          this.PicList = res["Data"].users;
          this.filtered_pic.next(this.PicList);

          this.VesselList = res["Data"].vessels;

          this.filtered_vessel.next(this.VesselList);
          this.firstFormGroup.controls["vessel_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_vessel_List(val);
            });

          this.PortList = res["Data"].ports;
          this.filtered_port.next(this.PortList);
          this.firstFormGroup.controls["port_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_List(val);
            });

          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
          this.firstFormGroup.controls["currency_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.currency_filter_List(val);
            });

          if (!this.IsEdit) {
            this.generateRefNumber();
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
  generateRefNumber() {
    this.api
      .GetDataService("common/get-ref?s=TBL_DTL_PLAN_MAIN")
      .subscribe((res) => {
        if (res["Status"] == 200) {
          this.NewRefNumber = res["Data"].ref_number;
          this.firstFormGroup.get("REF_NUM").patchValue(this.NewRefNumber);
        }
      });
  }
  protected filter_AppointmentList(val: any) {
    if (!this.AppointmentList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_appointment.next(this.AppointmentList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.AppointmentList.filter(
      (s) => s["PARAMETER_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_appointment.next(filter);
  }
  protected filter_PicList(val: any) {
    if (!this.PicList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_pic.next(this.PicList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.PicList.filter(
      (s) =>
        `${s["USER_FIRST_NAME"]} ${s["USER_MIDDLE_NAME"]} ${s["USER_LAST_NAME"]}`
          .toLowerCase()
          .indexOf(search) > -1
    );
    this.filtered_pic.next(filter);
  }
  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.AppointmentList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "QKi6LhVnI947b2601-364b-434b-ac08-c726e17672e6"
      );
      this.filtered_status.next(
        sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "9vgAPneFve77687e4-26bb-4564-b17b-3b42d1d9ee96"
        )
      );
    }
    if (this.AppointmentList)
      this.filtered_appointment.next(this.AppointmentList);
  }

  InsertFormValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.UserData;
    console.log("data", data);
    fc["GUID"].setValue(data["GUID"]);
    fc["REF_NUM"].setValue(data["REF_NUM"]);
    fc["PORT_GUID"].setValue(data["PORT_GUID"]);
    fc["PRINCIPAL_GUID"].setValue(data["PRINCIPAL_GUID"]);

    fc["VESSEL_GUID"].setValue(data["VESSEL_GUID"]);
    fc["APPOINTMENT_GUID"].setValue(data["APPOINTMENT_GUID"]);
    fc["Agency_Fee"].setValue(data["Agency_Fee"]);
    fc["CTM_Amount"].setValue(data["CTM_Amount"]);
    fc["Crew_Change"].setValue(data["Crew_Change"]);

    fc["APPOINTMENT_REF"].setValue(data["APPOINTMENT_REF"]);
    fc["VESSEL_ETA"].setValue(
      data["VESSEL_ETA"]
        ? moment(data["VESSEL_ETA"]).format("DD MMM YYYY HH:mm")
        : ""
    );
    fc["VESSEL_ETD"].setValue(
      data["VESSEL_ETD"]
        ? moment(data["VESSEL_ETD"]).format("DD MMM YYYY HH:mm")
        : ""
    );
    fc["VESSEL_ACTUAL_ARR"].setValue(
      data["VESSEL_ACTUAL_ARR"]
        ? moment(data["VESSEL_ACTUAL_ARR"]).format("DD MMM YYYY HH:mm")
        : ""
    );
    fc["VESSEL_ACTUAL_DEP"].setValue(
      data["VESSEL_ACTUAL_DEP"]
        ? moment(data["VESSEL_ACTUAL_DEP"]).format("DD MMM YYYY HH:mm")
        : ""
    );

    fc["AGENT_GUID"].setValue(data["AGENT_GUID"]);
    fc["PLAN_STATUS_GUID"].setValue(data["PLAN_STATUS_GUID"]);
    fc["Remarks"].setValue(data["Remarks"]);

    fc["VESSEL_TYPE_NAME"].setValue(data["VESSEL_TYPE_NAME"]);
    fc["VESSEL_COMPANY_NAME"].setValue(data["COMPANY_NAME"]);
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }

  // this function is used to search list
  protected filter_List(val: any) {
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
    var filter = this.PortList.filter(
      (s) => s["Port_Name"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_port.next(filter);
  }
  protected currency_filter_List(val: any) {
    if (!this.CurrencyList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_currency.next(this.CurrencyList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CurrencyList.filter(
      (s) => s["Port_Name"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_currency.next(filter);
  }

  filter_vessel_List(val: any) {
    if (!this.VesselList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_vessel.next(this.VesselList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.VesselList.filter(
      (s) => s["VESSEL_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_vessel.next(filter);
  }

  CloseModal() {
    this.dialogRef.close(null);
  }
  Save() {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    if (data["VESSEL_ETA"]) {
      data["VESSEL_ETA"] = moment(
        data["VESSEL_ETA"],
        "DD MMM YYYY HH:mm"
      ).toISOString();
    }
    if (data["VESSEL_ETD"]) {
      data["VESSEL_ETD"] = moment(
        data["VESSEL_ETD"],
        "DD MMM YYYY HH:mm"
      ).toISOString();
    }
    if (data["VESSEL_ACTUAL_DEP"]) {
      data["VESSEL_ACTUAL_DEP"] = moment(
        data["VESSEL_ACTUAL_DEP"],
        "DD MMM YYYY HH:mm"
      ).toISOString();
    }
    if (data["VESSEL_ACTUAL_ARR"]) {
      data["VESSEL_ACTUAL_ARR"] = moment(
        data["VESSEL_ACTUAL_ARR"],
        "DD MMM YYYY HH:mm"
      ).toISOString();
    }
    // data["PLAN_STATUS_GUID"] = "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a";
    this.submit = false;
    this.SavePlanner(data, this.IsEdit ? "planner/update" : "planner/insert");
  }

  // this function is used to save planner
  SavePlanner(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        console.log(res);
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "Planner saved successfully",
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
