import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

@Component({
  selector: "fury-crew-update",
  templateUrl: "./crew-update.component.html",
  styleUrls: ["./crew-update.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CrewUpdateComponent implements OnInit {
  isControlAdded = false;
  firstFormGroup: FormGroup;
  submit = false;
  ReadOnly = false;
  filteredCategory: Array<object> = [];
  ErrorMessage: string = "";
  Services_Data: any = "";
  Remarks: string = "";
  IsEdit: Boolean = false;
  plannerData: any = null;
  public vendorList: Array<object> = [];
  public CurrencyList: Array<object> = [];
  public PlannerList: Array<object> = [];

  public filtered_crew_category: Array<object> = [];
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  protected _onDestroy = new Subject<void>();
  constructor(
    private dialogRef: MatDialogRef<CrewUpdateComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      Services_GUID: [""],
      Planner_GUID: [""],
      Vessel_Guid: [""],
      Vendor_GUID: ["3HhHkZJF63c88de93-75e2-44ec-987b-0dd2af7e9767"],
      Total_Amount: [0],
      Remarks: [""],
      planner_Filter: [""],
      Svc_Currency_GUID: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
    });
    this.loadSelectableData();
  }
  loadSelectableData() {
    const payload = {
      module: ["currency", "service_vendors", "planner"],
      planner_id: this.Services_Data ? this.Services_Data["Planner_GUID"] : "",
      plan_status: this.Services_Data
        ? ""
        : "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.vendorList = res["Data"].service_vendors.filter(
            (item) =>
              item["SERVICE_GUID"] ===
              "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
          );
          this.PlannerList = res["Data"].planner;
          this.filtered_planner.next(this.PlannerList);
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
          this.filtered_vendor.next(this.vendorList);
          if (!this.Services_Data) {
            this.loadCharges(null);
          }

          this.firstFormGroup.controls["planner_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.onFilterChange(
                val,
                "REF_NUM",
                this.PlannerList,
                this.filtered_planner
              );
            });

          this.firstFormGroup
            .get("Planner_GUID")
            .valueChanges.subscribe((_planner) => {
              let planner = this.PlannerList.filter(
                (item) => item["GUID"] === _planner
              );
              if (planner && planner.length) {
                this.plannerData = planner[0];
                this.loadCharges(this.plannerData["PRINCIPAL_GUID"]);
                this.firstFormGroup
                  .get("Vessel_Guid")
                  .setValue(this.plannerData["VESSEL_GUID"]);
              }
            });

          if (this.IsEdit && this.Services_Data) {
            var fc: object = this.firstFormGroup.controls;
            this.plannerData = this.PlannerList[0];
            fc["Services_GUID"].setValue(this.Services_Data["Services_GUID"]);
            fc["Vendor_GUID"].setValue(this.Services_Data["Vendor_GUID"]);
            fc["Svc_Currency_GUID"].setValue(
              this.Services_Data["Svc_Currency_GUID"]
            );
            fc["Planner_GUID"].setValue(this.plannerData["GUID"]);
            fc["Vessel_Guid"].setValue(this.plannerData["VESSEL_GUID"]);
            fc["Remarks"].setValue(this.Services_Data["Remarks"]);
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
  loadCharges(PRINCIPAL_GUID) {
    const payload = {
      module: ["company_charges", "crew_charges"],
      PRINCIPAL_GUID: PRINCIPAL_GUID,
      Services_GUID: this.Services_Data
        ? this.Services_Data["Services_GUID"]
        : "",
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      console.log(res);
      if (res["Status"] === 200) {
        const sysData = JSON.parse(localStorage.getItem("systemParamsData"));
        this.filtered_crew_category = sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "Hr5H0YaIH50f0572b-82d6-4e7a-ad24-f9062ae234b2"
        );
        const company_charges = res["Data"].company_charges;
        const crew_charges = res["Data"].crew_charges;

        this.filtered_crew_category = this.filtered_crew_category.map(
          (item, index) => {
            const charge = company_charges.find(
              (_item) => _item["CREW_TYPE_GUID"] === item["PARAMETER_GUID"]
            );
            const quantity = crew_charges.find(
              (_item) => _item["Service_Item_Guid"] === item["PARAMETER_GUID"]
            );
            console.log(charge, quantity);
            item["index"] = index;
            item["CREW_TYPE_GUID"] = item["PARAMETER_GUID"];
            item["Charge"] = charge ? charge["Charge"] : 0;
            item["Planned_Quantity"] = quantity
              ? quantity["Planned_Quantity"]
              : 0;
            item["Actual_Quantity"] = quantity
              ? quantity["Actual_Quantity"]
              : 0;
            item["Charge"] = quantity ? quantity["Rate"] : item["Charge"];
            return item;
          }
        );
        console.log(this.filtered_crew_category);
        this.getDimonitationScale();
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
  getDimonitationScale() {
    const that = this;
    console.log("filtered_crew_category", this.filtered_crew_category);
    let total = 0;
    if (this.isControlAdded) {
      this.filtered_crew_category.map((item) => {
        const actualQty = item["Actual_Quantity"] || 0;
        this.firstFormGroup
          .get("Category_" + item["index"])
          .patchValue(item["CREW_TYPE_GUID"]);
        this.firstFormGroup
          .get("Planned_Quantity_" + item["index"])
          .patchValue(item["Planned_Quantity"] || 0);
        this.firstFormGroup
          .get("Charge_" + item["index"])
          .patchValue(item["Charge"]);
        this.firstFormGroup
          .get("Actual_Quantity_" + item["index"])
          .patchValue(actualQty);
        this.firstFormGroup
          .get("Total_" + item["index"])
          .patchValue(actualQty * item["Charge"]);
      });
    } else {
      this.isControlAdded = true;
      this.filtered_crew_category.map((item) => {
        this.firstFormGroup.addControl(
          "Category_" + item["index"],
          this.fb.control(item["CREW_TYPE_GUID"])
        );
        this.firstFormGroup.addControl(
          "Charge_" + item["index"],
          this.fb.control(item["Charge"])
        );
        this.firstFormGroup.addControl(
          "Planned_Quantity_" + item["index"],
          this.fb.control(item["Planned_Quantity"] || 0)
        );
        const actualQty = item["Actual_Quantity"] || 0;
        this.firstFormGroup.addControl(
          "Actual_Quantity_" + item["index"],
          this.fb.control(actualQty)
        );
        total = total + actualQty * item["Charge"];
        this.firstFormGroup.addControl(
          "Total_" + item["index"],
          this.fb.control(actualQty * item["Charge"])
        );
        this.firstFormGroup
          .get("Actual_Quantity_" + item["index"])
          .valueChanges.subscribe(function (value_100) {
            let billValue =
              that.firstFormGroup.get("Charge_" + item["index"]).value || 0;
            const total = parseFloat(value_100) * parseFloat(billValue);

            that.firstFormGroup.get("Total_" + item["index"]).patchValue(total);
            that.calculateTotalAmount(that);
          });
        this.firstFormGroup
          .get("Charge_" + item["index"])
          .valueChanges.subscribe(function (value_100) {
            let billValue =
              that.firstFormGroup.get("Actual_Quantity_" + item["index"])
                .value || 0;
            const total = parseFloat(value_100) * parseFloat(billValue);

            that.firstFormGroup.get("Total_" + item["index"]).patchValue(total);
            that.calculateTotalAmount(that);
          });
        this.firstFormGroup.get("Total_Amount").setValue(total);
      });
    }
  }
  calculateTotalAmount(that) {
    let totalAmount = 0;
    that.filtered_crew_category.map((item) => {
      const amount = that.firstFormGroup.get("Total_" + item["index"]).value;
      totalAmount = totalAmount + (amount ? amount : 0);
    });

    that.firstFormGroup.get("Total_Amount").patchValue(totalAmount);
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
  saveServiceData() {
    this.submit = true;
    let data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    let payload = {};
    payload["crew_services"] = [];
    payload["Planner_Guid"] = this.firstFormGroup.get("Planner_GUID").value;
    payload["Vessel_Guid"] = this.firstFormGroup.get("Vessel_Guid").value;
    payload["Service_Guid"] = this.firstFormGroup.get("Services_GUID").value;
    payload["Svc_Currency_GUID"] =
      this.firstFormGroup.get("Svc_Currency_GUID").value;
    payload["Total_Amount"] = this.firstFormGroup.get("Total_Amount").value;
    payload["Vendor_GUID"] = this.firstFormGroup.get("Vendor_GUID").value;
    payload["Remarks"] = this.firstFormGroup.get("Remarks").value;
    this.filtered_crew_category.map((note) => {
      let obj = {
        Service_Item_Guid: data["Category_" + note["index"]],
        Planned_Quantity: data["Planned_Quantity_" + note["index"]],
        Actual_Quantity: data["Actual_Quantity_" + note["index"]],
        Rate: data["Charge_" + note["index"]],
        Total_Amount: data["Total_" + note["index"]],
      };
      payload["crew_services"].push(obj);
    });
    const URL = this.IsEdit ? "planner/crew/update" : "planner/crew/insert";
    this.api.PostDataService(URL, payload).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "Crew saved successfully",
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
  // getCrewServices(plannerId: string, serviceGuid: string) {
  //   this.api
  //     .GetDataService(`planner/crew/get/${plannerId}/${serviceGuid}`)
  //     .subscribe(
  //       (res: object) => {
  //         this.submit = false;
  //         if (res["Status"] === 200) {
  //           if (res["Data"] && res["Data"].length > 0)
  //             this.loadSelectableData();
  //         } else {
  //           // this.ErrorMessage = res['message'];
  //           this.common.ShowMessage(res["Message"], "notify-error", 6000);
  //         }
  //       },
  //       (error) => {
  //         this.submit = false;
  //         this.common.ShowMessage(error["Message"], "notify-error", 6000);
  //       }
  //     );
  // }
  //planner/crew/get/
  CloseModal() {
    this.dialogRef.close(true);
  }
}
