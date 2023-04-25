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
import { CustomValidator } from "src/app/custom.validator";

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
  selector: "fury-add-edit-users",
  templateUrl: "./add-edit-users.component.html",
  styleUrls: ["./add-edit-users.component.scss"],
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
export class AddEditUsersComponent implements OnInit {
  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  UserData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";
  iddCode = null;
  maxDate = new Date();

  CountryList: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filtered_country: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  hide = true;
  hideC = true;
  emailRegEx = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";

  constructor(
    private dialogRef: MatDialogRef<AddEditUsersComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group(
      {
        confirmPassword: [
          "",
          [Validators.required, CustomValidator.cannotContainSpace],
        ],
        LOGIN_ID: ["", Validators.required],
        EMAIL_ID: ["", [Validators.required, CustomValidator.EmailValidator]],
        PASSWORD: [
          "",
          [Validators.required, CustomValidator.cannotContainSpace],
        ],
        COMPANY_GUID: ["", Validators.required],
        country_Filter: [""],
        USER_FIRST_NAME: ["", Validators.required],
        USER_MIDDLE_NAME: [""],
        USER_LAST_NAME: [""],
        DOB: [""],
        USER_DESIGNATION: [""],
        DATE_OF_JOINING: [""],
        DATE_OF_PROBATION: [""],
        DATE_OF_CONFIRMATION: [""],
        DATE_OF_TERMINATION: [""],
        PRESENT_ADDRESS: [""],
        PERMANENT_ADDRESS: [""],
        PHONE_NUMBER: [""],
        ACTIVE_STATUS: [true],
        USER_GUID: [""],
        IDD_CODE: [""],
        Smtp_Host: [""],
        Smtp_Port: [""],
        Smtp_Secure: [""],
        Smtp_Username: [""],
        Smtp_Password: [""],
        Landing_Page: ["dashboard"],
      },
      {
        validator: CustomValidator.ConfirmedValidator(
          "PASSWORD",
          "confirmPassword"
        ),
      }
    );
    this.FetchAllCompany();
    if (this.IsEdit) {
      let thisVar = this;
      setTimeout(function () {
        thisVar.InsertFomrValues();
      }, 500);
    }
    this.firstFormGroup.valueChanges.subscribe((values) => {
      console.log(this.firstFormGroup);
    });
    this.firstFormGroup.controls["COMPANY_GUID"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        let selectedCountryData = this.CountryList.find(
          (s) => s["COUNTRY_GUID"] == val
        );
        if (selectedCountryData) {
          this.firstFormGroup.controls["IDD_CODE"].setValue(
            selectedCountryData["IDD_CODE"]
          );
          this.iddCode = "+" + selectedCountryData["IDD_CODE"];
        }
      });
    this.firstFormGroup.controls["country_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_List(val);
      });
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFomrValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.UserData;

    fc["USER_GUID"].setValue(data["USER_GUID"]);
    fc["LOGIN_ID"].setValue(data["LOGIN_ID"]);
    fc["EMAIL_ID"].setValue(data["EMAIL_ID"]);
    fc["USER_FIRST_NAME"].setValue(data["USER_FIRST_NAME"]);

    fc["USER_MIDDLE_NAME"].setValue(data["USER_MIDDLE_NAME"]);
    fc["USER_LAST_NAME"].setValue(data["USER_LAST_NAME"]);

    fc["USER_DESIGNATION"].setValue(data["USER_DESIGNATION"]);
    fc["PRESENT_ADDRESS"].setValue(data["PRESENT_ADDRESS"]);
    fc["PERMANENT_ADDRESS"].setValue(data["PERMANENT_ADDRESS"]);
    fc["PHONE_NUMBER"].setValue(data["PHONE_NUMBER"]);
    fc["COMPANY_GUID"].setValue(data["COMPANY_GUID"]);
    fc["Landing_Page"].setValue(data["Landing_Page"]);

    fc["ACTIVE_STATUS"].setValue(data["ACTIVE_STATUS"]);
 

    fc["DOB"].setValue(data["DOB"] ? data["DOB"].split("T")[0] : "");
    fc["DATE_OF_JOINING"].setValue(
      data["DATE_OF_JOINING"] ? data["DATE_OF_JOINING"].split("T")[0] : ""
    );
    fc["DATE_OF_PROBATION"].setValue(
      data["DATE_OF_PROBATION"] ? data["DATE_OF_PROBATION"].split("T")[0] : ""
    );
    fc["DATE_OF_CONFIRMATION"].setValue(
      data["DATE_OF_CONFIRMATION"]
        ? data["DATE_OF_CONFIRMATION"].split("T")[0]
        : ""
    );
    fc["DATE_OF_TERMINATION"].setValue(
      data["DATE_OF_TERMINATION"]
        ? data["DATE_OF_TERMINATION"].split("T")[0]
        : ""
    );
    if (data["COMPANY_GUID"]) {
      let selectedCountryData = this.CountryList.find(
        (s) => s["COUNTRY_GUID"] == data["COMPANY_GUID"]
      );
      console.log(selectedCountryData, "selectedCountryData", this.CountryList);
      if (selectedCountryData) {
        this.iddCode = "+" + selectedCountryData["IDD_CODE"];
      }
    }
  }
  get f() {
    return this.firstFormGroup.controls;
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }

  FetchAllCompany() {
    this.api.GetDataService("country/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.CountryList = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.filtered_country.next(this.CountryList);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  // this function is used to search list
  protected filter_List(val: any) {
    if (!this.CountryList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_country.next(this.CountryList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CountryList.filter(
      (s) => s["COUNTRY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_country.next(filter);
  }

  CloseModal() {
    this.dialogRef.close(null);
  }

  SaveUser() {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }

    if (data["PASSWORD"] !== data["confirmPassword"]) {
      this.submit = false;
      this.ErrorMessage = "Password and confirm password must be same";
      return;
    }
    this.submit = false;
    this.SaveAdminUser(data, this.IsEdit ? "user/update" : "user/insert");
  }

  // this function is used to save user
  SaveAdminUser(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        console.log(res);
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "User saved successfully",
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
