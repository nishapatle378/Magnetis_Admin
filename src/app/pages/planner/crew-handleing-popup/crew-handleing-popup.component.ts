import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { values } from "lodash";
import { Observable, Subject, ReplaySubject } from "rxjs";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

@Component({
  selector: "fury-crew-handleing-popup",
  templateUrl: "./crew-handleing-popup.component.html",
  styleUrls: ["./crew-handleing-popup.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CrewHandleingPopupComponent implements OnInit {
  crewForm: FormGroup;
  IsEdit = false;
  EditData = null;
  CurrencyList: Array<object> = [];
  PlannerList: Array<object> = [];
  Is_Cancelled = false;
  Services_GUID = null;
  PlannerServiceList: Array<object> = [];
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_plannerService: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  ErrorMessage = null;
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  constructor(
    private dialogRef: MatDialogRef<CrewHandleingPopupComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.crewForm = this.fb.group({
      Crew_Plan_GUID: [""],
      Vessel_GUID: [""],
      MEG_REF_NUM: [""],
      Services_GUID: [""],
      Planner_GUID: ["", Validators.required],
      Currency_GUID: [
        "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a",
        Validators.required,
      ],
      Crew_On_Plan: [""],
      Crew_Off_Plan: [""],
      Crew_On_RATE: [""],
      Crew_On_Actual: [""],
      Crew_On_Total: [""],
      Crew_Off_Rate: [""],
      Crew_Off_Actual: [""],
      Crew_Off_Total: [""],
      Crew_On_Off_Total: [""],
      Crew_Not_Joined_To_Charge: [""],
      Crew_Joined_To_Charge: [""],
      Remarks: [""],
      Is_Cancelled: ["0"],
      Port_Name: [""],
      Principal_Name: [""],
      Vessel_Name: [""],
    });

    this.loadSelectableData();
    this.crewForm.valueChanges.subscribe((values) => {
      // console.log(values);
      if (
        !isNaN(values["Crew_On_Plan"]) &&
        !isNaN(values["Crew_Off_Plan"]) &&
        !isNaN(values["Crew_On_Actual"]) &&
        !isNaN(values["Crew_On_Actual"])
      ) {
        let totalOriginalCrew =
          parseInt(values["Crew_On_Plan"]) + parseInt(values["Crew_Off_Plan"]);
        let totalFinalCrew =
          parseInt(values["Crew_On_Actual"]) +
          parseInt(values["Crew_Off_Actual"]);
        let Crew_Not_Joined_To_Charge = totalOriginalCrew - totalFinalCrew || 0;
        // this.crewForm.controls['Crew_Not_Joined_To_Charge'].patchValue(Crew_Not_Joined_To_Charge, {eventEmit: false});
        this.crewForm.patchValue(
          {
            Crew_Not_Joined_To_Charge: isNaN(Crew_Not_Joined_To_Charge)
              ? 0
              : Crew_Not_Joined_To_Charge,
          },
          { emitEvent: false }
        );
        this.crewForm.patchValue(
          { Crew_Joined_To_Charge: isNaN(totalFinalCrew) ? 0 : totalFinalCrew },
          { emitEvent: false }
        );
      }
    });
    this.crewForm.get("Crew_Off_Rate").valueChanges.subscribe((value) => {
      if (!isNaN(value)) {
        let Crew_Off_Rate = parseFloat(value);
        let Crew_Not_Joined_To_Charge = this.crewForm.get(
          "Crew_Not_Joined_To_Charge"
        ).value;
        const total = Crew_Off_Rate * Crew_Not_Joined_To_Charge;
        this.crewForm
          .get("Crew_Off_Total")
          .patchValue(isNaN(total) ? 0 : total);
      }
    });
    this.crewForm.get("Crew_On_RATE").valueChanges.subscribe((value) => {
      if (!isNaN(value)) {
        let Crew_On_Rate = parseFloat(value);
        let Crew_Joined_To_Charge = this.crewForm.get(
          "Crew_Joined_To_Charge"
        ).value;
        this.crewForm
          .get("Crew_On_Total")
          .patchValue(Crew_On_Rate * Crew_Joined_To_Charge);
      }
    });
    this.crewForm.get("Crew_On_Total").valueChanges.subscribe((value) => {
      if (!isNaN(value)) {
        let Crew_On_Total = value || 0;
        let Crew_Off_Total = this.crewForm.get("Crew_Off_Total").value || 0;
        let Crew_On_Off_Total =
          parseFloat(Crew_On_Total) + parseFloat(Crew_Off_Total);
        this.crewForm
          .get("Crew_On_Off_Total")
          .patchValue(
            isNaN(Crew_On_Off_Total) ? 0 : Crew_On_Off_Total.toFixed(2)
          );
      }
    });
    this.crewForm.get("Crew_Off_Total").valueChanges.subscribe((value) => {
      if (!isNaN(value)) {
        let Crew_Off_Total = value || 0;
        let Crew_On_Total = this.crewForm.get("Crew_On_Total").value || 0;
        let Crew_On_Off_Total =
          parseFloat(Crew_On_Total) + parseFloat(Crew_Off_Total);
        this.crewForm
          .get("Crew_On_Off_Total")
          .patchValue(
            isNaN(Crew_On_Off_Total) ? 0 : Crew_On_Off_Total.toFixed(2)
          );
      }
    });
    this.crewForm.get("Planner_GUID").valueChanges.subscribe((value) => {
      var fc: object = this.crewForm.controls;
      let selectedPlanner = this.PlannerList.find(
        (planner) => planner["GUID"] == value
      );
      if(selectedPlanner){
        fc["Port_Name"].setValue(selectedPlanner["Port_Name"]);
        fc["Principal_Name"].setValue(selectedPlanner["COMPANY_NAME"]);
        fc["Vessel_Name"].setValue(selectedPlanner["VESSEL_NAME"]);
        fc["Vessel_GUID"].setValue(selectedPlanner["VESSEL_GUID"]);
        this.fetchAllServiceByPlanner(value);
      }
    });

    if (this.IsEdit && this.EditData) {
      this.InsertIntoFormValues();
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

  InsertIntoFormValues() {
    var data = this.EditData;
    var fc: object = this.crewForm.controls;
    fc["Crew_Plan_GUID"].setValue(data["Crew_Plan_GUID"]);
    fc["Vessel_GUID"].setValue(data["Vessel_GUID"]);
    fc["Services_GUID"].setValue(data["Services_GUID"]);
    fc["Planner_GUID"].setValue(data["Planner_GUID"]);
    fc["Crew_On_Plan"].setValue(data["Crew_On_Plan"]);
    fc["Crew_Off_Plan"].setValue(data["Crew_Off_Plan"]);
    fc["Crew_On_RATE"].setValue(data["Crew_On_RATE"]);
    fc["Crew_On_Actual"].setValue(data["Crew_On_Actual"]);
    fc["Crew_On_Total"].setValue(data["Crew_On_Total"]);
    fc["Crew_Off_Rate"].setValue(data["Crew_Off_Rate"]);
    fc["Crew_Off_Total"].setValue(data["Crew_Off_Total"]);

    fc["Crew_Off_Actual"].setValue(data["Crew_Off_Actual"]);
    fc["Crew_On_Off_Total"].setValue(data["Crew_On_Off_Total"]);
    fc["Crew_Not_Joined_To_Charge"].setValue(data["Crew_Not_Joined_To_Charge"]);
    fc["Crew_Joined_To_Charge"].setValue(data["Crew_Joined_To_Charge"]);
    fc["Is_Cancelled"].setValue(data["Is_Cancelled"]);
    fc["Currency_GUID"].setValue(data["Currency_GUID"]);
    fc["Remarks"].setValue(data["Remarks"]);
  }

  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["currency", "planner"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (this.IsEdit && this.Services_GUID) {
          this.loaderLogData();
        }
        if (res["Status"] === 200) {
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
          this.PlannerList = res["Data"].planner;
          this.filtered_planner.next(this.PlannerList);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  loaderLogData() {
    this.api
      .GetDataService(`crew/get?Services_GUID=${this.Services_GUID}`)
      .subscribe(
        (res) => {
          if (res["Status"] === 200) {
            const data = res["Data"][0];
            if (data) {
              var fc: object = this.crewForm.controls;
              fc["Crew_Plan_GUID"].setValue(data["Crew_Plan_GUID"]);
              fc["Vessel_GUID"].setValue(data["Vessel_GUID"]);
              fc["Services_GUID"].setValue(data["Services_GUID"]);
              fc["Planner_GUID"].setValue(data["Planner_GUID"]);
              fc["Crew_On_Plan"].setValue(data["Crew_On_Plan"]);
              fc["Crew_Off_Plan"].setValue(data["Crew_Off_Plan"]);
              fc["Crew_On_RATE"].setValue(data["Crew_On_RATE"]);
              fc["Crew_On_Actual"].setValue(data["Crew_On_Actual"]);
              fc["Crew_On_Total"].setValue(data["Crew_On_Total"]);
              fc["Crew_Off_Rate"].setValue(data["Crew_Off_Rate"]);
              fc["Crew_Off_Total"].setValue(data["Crew_Off_Total"]);

              fc["Crew_Off_Actual"].setValue(data["Crew_Off_Actual"]);
              fc["Crew_On_Off_Total"].setValue(data["Crew_On_Off_Total"]);
              fc["Crew_Not_Joined_To_Charge"].setValue(
                data["Crew_Not_Joined_To_Charge"]
              );
              fc["Crew_Joined_To_Charge"].setValue(
                data["Crew_Joined_To_Charge"]
              );
              fc["Is_Cancelled"].setValue(data["Is_Cancelled"]);
              fc["Currency_GUID"].setValue(data["Currency_GUID"]);
              fc["Remarks"].setValue(data["Remarks"]);
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
  fetchAllServiceByPlanner(planner) {
    console.log("planner", planner);
    if (planner) {
      this.api
        .GetDataService(
          `planner/service/get-by-plan/${planner}/9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10`
        )
        .subscribe(
          (res) => {
            if (res["Status"] === 200) {
              this.PlannerServiceList = res["Data"];
              if (this.PlannerServiceList) {
                var fc: object = this.crewForm.controls;
                fc["Services_GUID"].setValue(
                  this.PlannerServiceList[0]["Services_GUID"]
                );
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
  }
  CloseModal() {
    this.dialogRef.close(null);
  }
  saveRecord() {
    this.ErrorMessage = "";

    var data: object = {};
    for (const elem in this.crewForm.value) {
      data[elem] = this.crewForm.value[elem];
    }
    if (this.IsEdit) {
      this.update(data, "crew/update");
    } else {
      this.Save(data, "crew/insert");
    }
  }
  update(data: object, path: string) {
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.crewForm.reset();
          // this.FetchAllData();
          this.common.ShowMessage(
            "Crew Log updated successfully",
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
  cancelledAndSave() {
    this.crewForm.get("Is_Cancelled").patchValue(1);
    this.crewForm.get("Crew_On_Actual").patchValue(0);
    this.crewForm.get("Crew_Off_Actual").patchValue(0);
    this.crewForm.get("Crew_On_RATE").patchValue(0);
    this.crewForm.get("Crew_Joined_To_Charge").patchValue(0);
    this.crewForm.get("Crew_On_Total").patchValue(0);
    this.Is_Cancelled = true;
    this.saveRecord();
  }
  Save(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Crew Log saved successfully",
            "notify-success",
            3000
          );
          this.crewForm.reset();
          this.dialogRef.close(true);
        } else {
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
