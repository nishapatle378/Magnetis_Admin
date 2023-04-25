import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";

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

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { QuickVesselComponent } from "../../vessel/quick-vessel/quick-vessel.component";
import { takeUntil } from "rxjs/operators";
import { AddEditSystemParameterComponent } from "../../system-parameter/add-edit-system-parameter/add-edit-system-parameter.component";


export const MY_FORMATS = {
  parse: {
    dateInput: "L",
  },
  display: {
    dateInput: "DD MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "fury-add-edit-support-logistics",
  templateUrl: "./add-edit-support-logistics.component.html",
  styleUrls: ["./add-edit-support-logistics.component.scss"],
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
export class AddEditSupportLogisticsComponent implements OnInit {
  protected _onDestroy = new Subject<void>();
  static id = 100;
  allSysParamData = [];
  form: FormGroup;
  submit: boolean = false;

  isLinear = true;
  logisticsForm: FormGroup;

  EditData: object = null;
  IsEdit: boolean = false;
  VesselList = [];
  PlannerList = [];
  CtmVendorList = [];
  PortList = [];
  CompanyList = [];
  typesList = [];
  recievedFromList = [];
  descriptionList = [];
  unitList = [];
  courierList = [];
  followUpList = [];
  destinationList = [];
  NewRefNumber = "";
  statusList = [];
  ctmForm: FormGroup;
  ErrorMessage: string = "";
  Remittance_Received_Attach = false;
  CTM_Ordered_Attach = false;
  CTM_in_Office_Attach = false;
  CTM_with_agent_Attach = false;
  Vessel_Acknowledgement_Attach = false;
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_company: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_ctm_vendors: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filtered_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_recievedFrom: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_description: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_unit: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_courier: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_out_courier: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_followUp: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_destination: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  CurrencyList: any;
  constructor(
    private dialogRef: MatDialogRef<AddEditSupportLogisticsComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.logisticsForm = this.fb.group({
      Logistics_GUID: [""],
      Type_GUID: ["", Validators.required],
      Log_Ref: ["", Validators.required],
      Date_Recieved: [new Date()],
      Recieved_From: [""],
      Vessel_GUID: ["", Validators.required],
      Vessel_NAME: [""],
      PRINCIPAL_GUID: [""],
      PRINCIPAL_NAME: [""],
      VESSEL_TYPE_NAME: [""],
      Description: ["", Validators.required],
      Log_Quantity: [1, Validators.required],
      Unit_GUID: ["", Validators.required],
      Principal_Ref: ["", Validators.required],
      Courier_GUID: ["", ],
      AWB: [""],
      Followup_GUID: ["", Validators.required],
      Destination: [""],
      Status_GUID: ["FjLBe0IHge8f9cf89-8ccc-4c7b-9b86-007dba41d92d", Validators.required],
      Remarks: [""],
      Delivery_Date: [],
      

      Outgoing_Courier: [""],
      Outgoing_AWB: [""],
      Outgoing_Attachment: [""],
      Currency: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Date_Of_Dispatch: [],
      Outgoing_Remark: [""],
      DeliveryDate: [],
      Billable: [],
      Amount: [0],
      vessel_Filter: [""],
      description_Filter: [""],
      unit_Filter: [""],
      courier_Filter: [""],
      out_courier_Filter: [""],
      received_From_Filter: [""],
      destination_Filter: [""],
      followup_Filter: [""],
    });

    this.logisticsForm.get("Type_GUID").valueChanges.subscribe((type) => {
      if (type == "dnE6If30K4b792387-04d9-4b18-abf8-c4745699fc15") {
      }
    });
    this.logisticsForm.get("description_Filter").valueChanges.subscribe((type) => {
     this.onFilterChange(type, 'PARAMETER_NAME', this.descriptionList, this.filtered_description)
    });
    this.logisticsForm.get("unit_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.unitList, this.filtered_unit)
     });
     this.logisticsForm.get("courier_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.courierList, this.filtered_courier)
     });
     this.logisticsForm.get("out_courier_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.courierList, this.filtered_out_courier)
     });
     this.logisticsForm.get("received_From_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.recievedFromList, this.filtered_recievedFrom)
     });
     this.logisticsForm.get("destination_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.destinationList, this.filtered_destination)
     });
     this.logisticsForm.get("followup_Filter").valueChanges.subscribe((type) => {
      this.onFilterChange(type, 'PARAMETER_NAME', this.followUpList, this.filtered_followUp)
     });
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    this.allSysParamData = sysData;
    this.getSysTemParameter(this.allSysParamData);
    this.loadSelectableData();
    let thisVar = this;
    this.logisticsForm.get("Recieved_From").valueChanges.subscribe((value) => {
      if (value === "addReceived") {
        let parent = this.recievedFromList.length
          ? this.recievedFromList[0]["PARENT_GUID"]
          : "";
        this.handleAddSystemParameter(
          parent,
          thisVar,
          this.recievedFromList.length,
          "Recieved_From"
        );
      }
    });
    this.logisticsForm.get("Description").valueChanges.subscribe((value) => {
      if (value === "addDescrition") {
        let parent = this.descriptionList.length
          ? this.descriptionList[0]["PARENT_GUID"]
          : "";
        this.handleAddSystemParameter(
          parent,
          thisVar,
          this.descriptionList.length,
          "Description"
        );
      }
    });
    this.logisticsForm.get("Destination").valueChanges.subscribe((value) => {
      if (value === "addDestination") {
        let parent = this.destinationList.length
          ? this.destinationList[0]["PARENT_GUID"]
          : "";
        this.handleAddSystemParameter(
          parent,
          thisVar,
          this.destinationList.length,
          "Destination"
        );
      }
    });
    this.logisticsForm.get("Unit_GUID").valueChanges.subscribe((value) => {
      if (value === "addUnit") {
        let parent = this.unitList ? this.unitList[0]["PARENT_GUID"] : "";
        this.handleAddSystemParameter(
          parent,
          thisVar,
          this.unitList.length,
          "Unit_GUID"
        );
      }
    });
    this.logisticsForm.get("Vessel_GUID").valueChanges.subscribe((vessle) => {
      if (vessle === "ADDVESSEL") {
        const dialogRef = this.dialog.open(QuickVesselComponent, {
          width: "50%",
          maxHeight: "100%",
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            this.logisticsForm.get("Vessel_GUID").setValue(data);
            this.updateVesselData(data);
          }
        });
      } else {
        let vesselData = this.VesselList.find(
          (item) => item["VESSEL_GUID"] == vessle
        );
        if (vesselData) {
          thisVar.logisticsForm
            .get("PRINCIPAL_GUID")
            .patchValue(vesselData["COMPANY_GUID"]);
          thisVar.logisticsForm
            .get("VESSEL_TYPE_NAME")
            .patchValue(vesselData["VESSEL_TYPE_NAME"]);
          thisVar.logisticsForm
            .get("PRINCIPAL_NAME")
            .patchValue(vesselData["COMPANY_NAME"]);
        }
      }
    });
  }
  getFileURL(fileName){
    return `${this.api.API_HOST}${fileName}`
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
  handleAddSystemParameter(parent_id: string, thisVar: any, order, fieldName) {
    const dialogRef = thisVar.dialog.open(AddEditSystemParameterComponent, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });

    dialogRef.componentInstance.order = order + 1;
    dialogRef.componentInstance.AllData = thisVar.allSysParamData;
    dialogRef.componentInstance.selectedGreatData = {
      PARAMETER_GUID: parent_id,
    };
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        thisVar.logisticsForm.get(fieldName).patchValue(data["PARAMETER_GUID"]);
        this.api.GetDataService("sp/all").subscribe(
          (res: any) => {
            if (res["Status"] === 200) {
              const sysparam = res["Data"]
                .filter((item) => 1 === item["ACTIVE_STATUS"])
                .map((item) => ({
                  PARAMETER_GUID: item.PARAMETER_GUID,
                  PARAMETER_NAME: item.PARAMETER_NAME,
                  PARAMETER_SHORT_NAME: item.PARAMETER_SHORT_NAME,
                  PARENT_GUID: item.PARENT_GUID,
                  SORT_ORDER: item.SORT_ORDER,
                  ACTIVE_STATUS: item.ACTIVE_STATUS,
                }));
              localStorage.setItem(
                "systemParamsData",
                JSON.stringify(sysparam)
              );
              this.allSysParamData = sysparam;
              this.getSysTemParameter(this.allSysParamData);
            } else {
              this.common.ShowMessage(res.Message, "notify-error", 4000);
            }
          },
          (error) => {
            this.common.ShowMessage("Login Failed", "notify-error", 4000);
          }
        );
      }
    });
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
            this.logisticsForm
              .get("PRINCIPAL_GUID")
              .patchValue(vesselData["COMPANY_GUID"]);
            this.logisticsForm
              .get("VESSEL_TYPE_NAME")
              .patchValue(vesselData["VESSEL_TYPE_NAME"]);
            this.logisticsForm
              .get("PRINCIPAL_NAME")
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
  generateRefNumber() {
    this.api
      .GetDataService("common/get-ref?s=TBL_DTL_SUPPORT_LOGISTICS")
      .subscribe((res) => {
        if (res["Status"] == 200) {
          this.NewRefNumber = res["Data"].ref_number;
          console.log(this.NewRefNumber);
          this.logisticsForm.get("Log_Ref").patchValue(res["Data"].ref_number);
        }
      });
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["vessels", "currency",],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] == 200) {
          this.VesselList = res["Data"].vessels;
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
          this.filtered_vessel.next(this.VesselList);
          this.logisticsForm.controls["vessel_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_vessel_List(val);
            });
          console.log(this.IsEdit, this.EditData);
          if (this.IsEdit && this.EditData) {
            this.insertIntoFormData();
          }
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
  fileDelete() {
    this.logisticsForm.get("Outgoing_Attachment").setValue("");
  }
  uploadFileEvt(event) {
    const file: File = event.target.files[0];
    let thisVar = this;
    if (file) {
      const formData = new FormData();
      formData.append("sampleFile", file);
      const upload$ = this.api.FormPostApi("/upload", formData);
      upload$
        .then((response) => response.json())
        .then((res) => {
          if (res["Status"] == 200) {
            thisVar.logisticsForm.get("Outgoing_Attachment").patchValue(res["data"]);
          }
        });
    }
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

  insertIntoFormData() {
    try {
      const data = this.EditData;
      var fc: object = this.logisticsForm.controls;
      fc["Logistics_GUID"].patchValue(data["Logistics_GUID"]);
      fc["Type_GUID"].patchValue(data["Type_GUID"]);
      fc["Log_Ref"].patchValue(data["Log_Ref"]);
      fc["Vessel_GUID"].patchValue(data["Vessel_GUID"]);

      fc["Recieved_From"].patchValue(data["Recieved_From"]);
      fc["Description"].patchValue(data["Description"]);
      fc["Unit_GUID"].patchValue(data["Unit_GUID"]);
      fc["Destination"].patchValue(data["Destination"]);

      fc["Date_Recieved"].patchValue(data["Date_Recieved"]);
      fc["PRINCIPAL_GUID"].patchValue(data["PRINCIPAL_GUID"]);
      fc["Log_Quantity"].patchValue(data["Log_Quantity"]);
      fc["Principal_Ref"].patchValue(data["Principal_Ref"]);
      fc["Courier_GUID"].patchValue(data["Courier_GUID"]);
      fc["AWB"].patchValue(data["AWB"]);
      fc["Followup_GUID"].patchValue(data["Followup_GUID"]);
      fc["Status_GUID"].patchValue(data["Status_GUID"]);
      fc["Remarks"].patchValue(data["Remarks"]);
      fc["Delivery_Date"].patchValue(data["Delivery_Date"] ? data["Delivery_Date"] : null);

      fc["Outgoing_Courier"].patchValue(data["Outgoing_Courier"]);
      fc["Outgoing_AWB"].patchValue(data["Outgoing_AWB"]);
      fc["Outgoing_Attachment"].patchValue(data["Outgoing_Attachment"]);
      fc["Currency"].patchValue(data["Currency"]);
      fc["Date_Of_Dispatch"].patchValue(data["Date_Of_Dispatch"]);
      fc["Outgoing_Remark"].patchValue(data["Outgoing_Remark"]);
      fc["Billable"].patchValue(data["Billable"]);
      fc["Amount"].patchValue(data["Amount"]);
    } catch (error) {
      console.log(error);
    }
  }
  getSysTemParameter(sysData) {
    if (sysData) {
      //Logistic Received from
      this.recievedFromList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "J9vIGVobTf34ad5ba-0913-410e-8247-0f70947eab06"
      );
      //Logistic Types
      this.typesList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "0AWw8rhJF02eca503-4e2f-4182-a231-b4a4e85416a5"
      );
      //Description
      this.descriptionList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "W2Ek6Lag486806328-f38b-4cb3-af0a-84380a8af5ba"
      );
      //Logistic Unit
      this.unitList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "qGeYGifEvd95562a0-6567-46b3-888c-4746f5a8f920"
      );
      //Follow up
      this.followUpList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "ZmfEjWmux28983edd-5b8c-453d-8a63-e8da49bec320"
      );
      //Destination List
      this.destinationList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "qoyVliwes8a2fb2de-7459-4e41-a307-1a35494bcfbd"
      );
      //Courier List
      this.courierList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "vsar359bN936ec994-0683-4894-bdd7-04bbf17abe19"
      );
      //Status List
      this.statusList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Ne9T07SH10acc4f88-02fd-4fc2-a46f-69c2b7d4589b"
      );
      console.log(this.typesList, this.recievedFromList);
      this.filtered_type.next(this.typesList);
      this.filtered_recievedFrom.next(this.recievedFromList);
      this.filtered_description.next(this.descriptionList.sort((a, b) => a['PARAMETER_NAME'].localeCompare(b['PARAMETER_NAME'])));
      this.filtered_unit.next(this.unitList);
      this.filtered_followUp.next(this.followUpList);
      this.filtered_destination.next(this.destinationList);
      this.filtered_courier.next(this.courierList);
      this.filtered_out_courier.next(this.courierList);
      this.filtered_status.next(this.statusList);
    }
  }
  CloseModal() {
    this.dialogRef.close(true);
  }
  SaveLogistics() {
    this.ErrorMessage = "";
    var data: object = {};
    for (const elem in this.logisticsForm.value) {
      data[elem] = this.logisticsForm.value[elem];
    }
    if (data["Recieved_From"] === "manual") {
      data["Recieved_From"] = data["Recieved_From_Text"];
    }
    if (data["Description"] === "manual") {
      data["Description"] = data["Description_Text"];
    }
    if (data["Unit_GUID"] === "manual") {
      data["Unit_GUID"] = data["Unit_Text"];
    }

    if (data["Destination"] === "manual") {
      data["Destination"] = data["Destination_Text"];
    }

    if (this.IsEdit) {
      this.update(data, "support-logistic/update");
    } else {
      this.Save(data, "support-logistic/insert");
    }
  }

  update(data: object, path: string) {
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.logisticsForm.reset();
          // this.FetchAllData();
          this.common.ShowMessage(
            "Logistics updated successfully",
            "notify-success",
            3000
          );
          this.dialogRef.close(true);
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

  Save(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Logistics saved successfully",
            "notify-success",
            3000
          );
          this.logisticsForm.reset();
          this.dialogRef.close(true);
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
}
