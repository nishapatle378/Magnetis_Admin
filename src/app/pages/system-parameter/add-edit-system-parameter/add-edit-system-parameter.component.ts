import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from "@angular/core";
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
  selector: "add-edit-system-parameter",
  templateUrl: "./add-edit-system-parameter.component.html",
  styleUrls: ["./add-edit-system-parameter.component.scss"],
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
export class AddEditSystemParameterComponent implements OnInit, OnDestroy {
  static id = 100;

  form: FormGroup;
  title: string = "";
  type: string;
  submit: boolean = false;
  order: number;
  selectedModuleData = null;
  selectedParentData = null;
  selectedChildData = null;
  selectedGrandData = null;
  selectedGreatData = null;

  isLinear = true;
  firstFormGroup: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  AllData: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filtered_sp: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filteredRole: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditSystemParameterComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      PARAMETER_GUID: [""],
      PARENT_GUID: [""],
      PARAMETER_SHORT_NAME: ["", Validators.required],
      PARAMETER_NAME: ["", Validators.required],
      sp_Filter: [""],
      PARAMETER_REMARKS: [""],
      SORT_ORDER: [this.order, Validators.required],
      CREATED_BY: ["SUPER ADMIN"],
      MODIFIED_BY: ["SUPER ADMIN"],
    });
    let listing = this.AllData;
    let parentCount = null;
    if (this.type == "module") {
      listing = this.AllData.filter((s) => s["PARENT_GUID"] == "");
    } else if (this.type == "parent") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedModuleData["PARENT_GUID"]
      );
      parent = this.selectedModuleData["PARENT_GUID"];
    } else if (this.type == "child") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedParentData["PARENT_GUID"]
      );
      parent = this.selectedParentData["PARENT_GUID"];
    } else if (this.type == "grand") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedChildData["PARENT_GUID"]
      );
      parent = this.selectedGrandData["PARENT_GUID"];
    } else if (this.type == "great") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedGrandData["PARENT_GUID"]
      );
      parent = this.selectedGrandData["PARENT_GUID"];
    } else {
      listing = this.AllData;
    }
    if (this.type == "parent" && this.selectedModuleData) {
      this.firstFormGroup.controls["PARENT_GUID"].setValue(
        this.selectedModuleData["PARAMETER_GUID"]
      );
    } else if (this.type == "child" && this.selectedParentData) {
      this.firstFormGroup.controls["PARENT_GUID"].setValue(
        this.selectedParentData["PARAMETER_GUID"]
      );
    } else if (this.type == "grand" && this.selectedChildData) {
      this.firstFormGroup.controls["PARENT_GUID"].setValue(
        this.selectedChildData["PARAMETER_GUID"]
      );
    } else if (this.type == "grand" && this.selectedGreatData) {
      this.firstFormGroup.controls["PARENT_GUID"].setValue(
        this.selectedGreatData["PARAMETER_GUID"]
      );
    } else if (this.selectedGreatData) {
      this.firstFormGroup.controls["PARENT_GUID"].setValue(
        this.selectedGreatData["PARAMETER_GUID"]
      );
    }

    parentCount = this.AllData.filter(
      (s) =>
        s["PARENT_GUID"] == this.firstFormGroup.get("PARENT_GUID").value || ""
    ).length;

    this.firstFormGroup.get("SORT_ORDER").setValue(parentCount + 1);
    this.filtered_sp.next(listing);
    this.firstFormGroup.controls["sp_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.filter_sp_List(val);
      });

    if (this.IsEdit) {
      this.InsertFormValues();
    }
    console.log(this.type, "type in add/edit form ");
  }

  ngOnDestroy() {}

  // this function is used to search system parameter
  protected filter_sp_List(val: any) {
    let listing = this.AllData;
    if (this.type == "module") {
      listing = this.AllData.filter((s) => s["PARENT_GUID"] == "");
    } else if (this.type == "parent") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedModuleData["PARENT_GUID"]
      );
    } else if (this.type == "child") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedParentData["PARENT_GUID"]
      );
    } else if (this.type == "grand") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedChildData["PARENT_GUID"]
      );
    } else if (this.type == "great") {
      listing = this.AllData.filter(
        (s) => s["PARENT_GUID"] == this.selectedGrandData["PARENT_GUID"]
      );
    }
    if (!listing) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_sp.next(listing);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = listing.filter(
      (s) => s["PARAMETER_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_sp.next(filter);
  }

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFormValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc["PARAMETER_GUID"].setValue(data["PARAMETER_GUID"]);
    fc["PARENT_GUID"].setValue(data["PARENT_GUID"]);
    fc["PARAMETER_SHORT_NAME"].setValue(data["PARAMETER_SHORT_NAME"]);
    fc["PARAMETER_NAME"].setValue(data["PARAMETER_NAME"]);

    fc["PARAMETER_REMARKS"].setValue(data["PARAMETER_REMARKS"]);
    fc["SORT_ORDER"].setValue(data["SORT_ORDER"]);
  }

  TimeEvent(type: string, event: MatDatepickerInputEvent<Date>, time: string) {
    this.firstFormGroup.controls[time].setValue(
      new Date(event.value["_d"]).toISOString()
    );
  }

  CloseModal() {
    this.dialogRef.close(null);
  }

  SaveData() {
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
    this.Save(data, this.IsEdit ? "sp/update" : "sp/insert");
  }

  // this function is used to save currency
  Save(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.dialogRef.close(res["Data"]);
          this.common.ShowMessage(
            "System parameter saved successfully",
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
