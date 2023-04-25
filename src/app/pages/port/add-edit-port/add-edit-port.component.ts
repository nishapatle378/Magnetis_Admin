import { Component, Inject, OnInit } from "@angular/core";
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
  selector: "add-edit-port",
  templateUrl: "./add-edit-port.component.html",
  styleUrls: ["./add-edit-port.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddEditPortComponent implements OnInit {
  static id = 100;

  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  firstFormGroup: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  CountryList: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filtered_country: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditPortComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      PORT_GUID: [""],
      World_port_index_number: [""],
      Port_Name: ["", Validators.required],
      PORT_SHORT_CODE: ["", Validators.required],
      Country_GUID: ["", Validators.required],
      country_Filter: [""],
      Latitude_degrees: [""],
      Latitude_minutes: [""],
      Latitude_seconds: [""],
      Latitude_hemisphere: [""],
      Longitude_degrees: [""],
      Longitude_minutes: [""],
      Longitude_seconds: [""],
      Longitude_hemisphere: [""],
      CREATED_BY: ["SUPER ADMIN"],
      MODIFIED_BY: ["SUPER ADMIN"],
    });

    this.FetchAllCountry();

    if (this.IsEdit) {
      this.InsertFormValues();
    }
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc["PORT_GUID"].setValue(data["PORT_GUID"]);
    fc["World_port_index_number"].setValue(data["World_port_index_number"]);
    fc["Port_Name"].setValue(data["Port_Name"]);
    fc["PORT_SHORT_CODE"].setValue(data["PORT_SHORT_CODE"]);
    fc["Country_GUID"].setValue(data["Country_GUID"]);
  }

  FetchAllCountry() {
    this.api.GetDataService("country/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.CountryList = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.filtered_country.next(this.CountryList);
          this.firstFormGroup.controls["country_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_List(val);
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

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }

  CloseModal() {
    this.dialogRef.close(null);
  }

  SaveCountry(addMore = false) {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }

    this.submit = false;
    this.Save(data, this.IsEdit ? "port/update" : "port/insert", addMore);
  }

  // this function is used to save currency
  Save(data: object, path: string, addMore) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          if (addMore) {
            this.firstFormGroup.reset();
          } else {
            this.dialogRef.close(true);
          }
          this.common.ShowMessage(
            "Port saved successfully",
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
