import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

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
  selector: "add-edit-company",
  templateUrl: "./add-edit-company.component.html",
  styleUrls: ["./add-edit-company.component.scss"],
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
export class AddEditCompanyComponent implements OnInit {
  static id = 100;

  form: FormGroup;
  submit: boolean = false;
  companyAddresses = []
  isLinear = true;
  firstFormGroup: FormGroup;

  crewServiceArray = [];

  EditData: object = null;
  IsEdit: boolean = false;
  ErrorMessage: string = "";

  CurrencyList: Array<object> = [];
  CountryList: Array<object> = [];
  GroupList: Array<object> = [];
  CrewChargesArr: Array<object> = [];

  protected _onDestroy = new Subject<void>();
  public filteredCurrency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filteredCountry: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<AddEditCompanyComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.firstFormGroup = this.fb.group({
      COMPANY_GUID: [""],
      COMPANY_NAME: ["", Validators.required],
      SHORT_NAME: [""],
      COMPANY_TYPE: [""],
      REGISTRATION_NUM: ["", Validators.required],
      INCORPORATED_ON: [""],
      BASE_CURRENCY: ["", Validators.required],
      currency_filter: [""],
      OFF_ADDRESS: [""],
      OFF_CITY: [""],
      OFF_COUNTRY: [""],
      country_filter: [""],
      OFF_ZIP: [""],
      OFF_PHONE_1: [""],
      OFF_PHONE_2: [""],
      OFF_EMAIL_1: [""],
      OFF_EMAIL_2: [""],
      OFF_FAX_1: [""],
      OFF_FAX_2: [""],
      CREATED_BY: ["SUPER ADMIN"],
      MODIFIED_BY: ["SUPER ADMIN"],
    });

    this.getCrewServices();
    this.loadSelectableData();
  }
  getCrewServices() {
    let thisVar = this;
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.crewServiceArray = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Hr5H0YaIH50f0572b-82d6-4e7a-ad24-f9062ae234b2"
      );
      this.crewServiceArray = this.crewServiceArray.map((item, index) => {
        item["index"] = index;
        return item;
      });
      this.crewServiceArray.map((item) => {
        thisVar.firstFormGroup.addControl(
          "Charge_" + item.index,
          this.fb.control(0)
        );
      });
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

  ValidNumberInput(type: string, value: string) {
    var val = this.common.NumericPattern(value);
    this.firstFormGroup.controls[type].setValue(val);
  }

  InsertFomrValues() {
    var fc: object = this.firstFormGroup.controls;
    var data = this.EditData;

    fc["COMPANY_GUID"].setValue(data["COMPANY_GUID"]);
    fc["COMPANY_NAME"].setValue(data["COMPANY_NAME"]);
    fc["SHORT_NAME"].setValue(data["SHORT_NAME"]);
    fc["COMPANY_TYPE"].setValue(data["COMPANY_TYPE"]);

    fc["REGISTRATION_NUM"].setValue(data["REGISTRATION_NUM"]);
    fc["INCORPORATED_ON"].setValue(data["INCORPORATED_DATE"]);

    fc["BASE_CURRENCY"].setValue(data["BASE_CURRENCY"]);
    fc["OFF_ADDRESS"].setValue(data["OFF_ADDRESS"]);
    fc["OFF_CITY"].setValue(data["OFF_CITY"]);
    fc["OFF_COUNTRY"].setValue(data["OFF_COUNTRY"]);

    fc["OFF_ZIP"].setValue(data["OFF_ZIP"]);
    fc["OFF_PHONE_1"].setValue(data["OFF_PHONE_1"]);

    fc["OFF_PHONE_2"].setValue(data["OFF_PHONE_2"]);
    fc["OFF_EMAIL_1"].setValue(data["OFF_EMAIL_1"]);
    fc["OFF_EMAIL_2"].setValue(data["OFF_EMAIL_2"]);
    fc["OFF_FAX_1"].setValue(data["OFF_FAX_1"]);
    if(data["ADDRESS_LIST_JSON"]){
      const companyAddresses = JSON.parse(data["ADDRESS_LIST_JSON"]);
      this.companyAddresses = companyAddresses.map((_item, index) => {
        this.firstFormGroup.addControl(
          "Company_" + index,
          this.fb.control(_item)
        );
        return index;
      })
    }
    
    fc["OFF_FAX_2"].setValue(data["OFF_FAX_2"]);
    if (this.CrewChargesArr && this.CrewChargesArr.length > 0) {
      this.CrewChargesArr.map((demon) => {
        let demonData = this.crewServiceArray.find(
          (item) => item.PARAMETER_GUID == demon["CREW_TYPE_GUID"]
        );
        if (demonData) {
          this.firstFormGroup
            .get("Charge_" + demonData["index"])
            .patchValue(demon["Charge"]);
        }
      });
    }
  }

  loadSelectableData() {
    const payload = {
      module: ["company_charges", "currency", "country"],
      PRINCIPAL_GUID: this.EditData ? this.EditData["COMPANY_GUID"] : "",
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      this.CurrencyList = res["Data"].currency.filter(
        (u: object) => u["ACTIVE_STATUS"]
      );
      this.filteredCurrency.next(this.CurrencyList);
      this.firstFormGroup.controls["currency_filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.filterCurrencyList(val);
        });
      this.CountryList = res["Data"].country.filter(
        (u: object) => u["ACTIVE_STATUS"]
      );
      this.filteredCountry.next(this.CountryList);
      this.firstFormGroup.controls["country_filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.filterCountryList(val);
        });
      if (res["Data"].company_charges) {
        this.CrewChargesArr = res["Data"].company_charges;
      }
      if (this.IsEdit && this.EditData) {
        this.InsertFomrValues();
      }
    });
  }

  // this function is used to filter branch
  protected filterCurrencyList(val: any) {
    if (!this.CurrencyList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filteredCurrency.next(this.CurrencyList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CurrencyList.filter(
      (bank) => bank["SHORT_CODE"].toLowerCase().indexOf(search) > -1
    );
    this.filteredCurrency.next(filter);
  }
  // this function is used to filter country list
  protected filterCountryList(val: any) {
    if (!this.CountryList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filteredCountry.next(this.CountryList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CountryList.filter(
      (bank) => bank["COUNTRY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filteredCountry.next(filter);
  }

  CloseModal() {
    this.dialogRef.close(true);
  }
  addNewAddress(){
    let addressSeq = this.companyAddresses.length
    this.companyAddresses.push(addressSeq)
    this.firstFormGroup.addControl(
      "Company_" + addressSeq,
      this.fb.control("")
    );
  }
  SaveCompany(addNew = false) {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    data["crew_charges"] = this.crewServiceArray.map((item) => {
      return {
        Crew_Type_Guid: item.PARAMETER_GUID,
        Charge: this.firstFormGroup.get("Charge_" + item.index).value,
      };
    });
     const AddressList= this.companyAddresses.map((_item, index) => this.firstFormGroup.get("Company_" + index).value).filter(_item => _item && _item != '');
     data['ADDRESS_LIST_JSON'] = JSON.stringify(AddressList);
     this.submit = false;
    this.Save(data, this.IsEdit ? "company/update" : "company/insert", addNew);
  }

  // this function is used to save company
  Save(data: object, path: string, addNew) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        this.common.ShowMessage(
          "Company saved successfully",
          "notify-success",
          3000
        );
        if (res["Status"] === 200) {
          if (addNew) {
            this.firstFormGroup.reset();
          } else {
            this.dialogRef.close(true);
          }
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
