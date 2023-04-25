import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ReplaySubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import * as XLSX from "xlsx";
import { UpdateFollowupComponent } from "../update-followup/update-followup.component";

@Component({
  selector: "fury-follow-up-list",
  templateUrl: "./follow-up-list.component.html",
  styleUrls: ["./follow-up-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class FollowUpListComponent implements OnInit {
  allServiceList: Array<object> = [];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  dataSourceBoatCount = [];
  AllData: Array<object> = [];
  BoatTypeList: Array<object> = [];

  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "Planner", visible: true, name: "Planner Ref" },
    { property: "Principal", visible: true, name: "Principal Name" },
    { property: "Vessel", visible: true, name: "Vessel Name" },
    // { property: "Service_Type", visible: true, name: "Service Type" },
    // { property: "Service_Date", visible: true, name: "Service Date" },
    // { property: "Svc_Quantity", visible: true, name: "Quantity" },
    // { property: "Vendor_Name", visible: true, name: "Vendor" },
    // { property: "Currency_Name", visible: true, name: "Currency" },
    // { property: "Svc_Amount", visible: true, name: "Amount" },
    { property: "Remarks", visible: true, name: "Remark" },
    { property: "Status_GUID", visible: true, name: "Status" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterFormGroup: FormGroup;
  loading: boolean = true;
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  VendorList: Array<object> = [];
  PlannerList: Array<object> = [];
  ServiceTypeList: Array<object> = [];
  ServiceCategoryList: Array<object> = [];

  CompanyList: Array<object> = [];
  AllCompanyList: Array<object> = [];
  AllVendorList: Array<object> = [];
  AllPlannerList: Array<object> = [];
  AllVesselList: Array<object> = [];

  protected _onDestroy = new Subject<void>();

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_boat_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_service_type: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_service_category: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      VESSEL_GUID: [""],
      PLANNER_GUID: [""],
      PRINCIPAL_GUID: [""],
      Status_GUID: [["ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943"]],
      Service_Type_GUID: [""],
      Service_Category_GUID: [""],
      Vendor_GUID: [""],
      principal_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
      type_Filter: [""],
      category_Filter: [""],
      vendor_Filter: [""],
    });
    this.loadCrewData(
      "followup/get?Status_GUID=ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943",
      this.loadSelectableData
    );
    this.fetchServiceType();
    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((principal) => {
        this.filtered_vessel.next(
          this.VesselList.filter(
            (_vessel) => _vessel["COMPANY_GUID"] === principal
          )
        );
      });
    this.filterFormGroup.get("VESSEL_GUID").valueChanges.subscribe((vessel) => {
      const principal = this.filterFormGroup.get("PRINCIPAL_GUID").value;
      if (principal && "" !== principal) {
        this.filtered_planner.next(
          this.PlannerList.filter(
            (_planner) =>
              _planner["PRINCIPAL_GUID"] === principal &&
              _planner["VESSEL_GUID"] === vessel
          )
        );
      } else {
        this.filtered_planner.next(
          this.PlannerList.filter(
            (_planner) => _planner["VESSEL_GUID"] === vessel
          )
        );
      }
    });
    this.filterFormGroup
      .get("Service_Type_GUID")
      .valueChanges.subscribe((service_type) => {
        this.filtered_vendor.next(
          this.VendorList.filter(
            (_vendor) => _vendor["SERVICE_GUID"] === service_type
          )
        );
      });
  }
  onClickSubmit(data) {
    this.loadCrewData(
      `followup/get?Planner_GUID=${
        data["PLANNER_GUID"] ? data["PLANNER_GUID"] : ""
      }&Principal_Guid=${
        data["PRINCIPAL_GUID"] ? data["PRINCIPAL_GUID"] : ""
      }&Vessel_GUID=${
        data["VESSEL_GUID"] ? data["VESSEL_GUID"] : ""
      }&Status_GUID=${
        data["Status_GUID"] ? data["Status_GUID"].join(",") : ""
      }&Service_Type=${
        data["Service_Type_GUID"] ? data["Service_Type_GUID"] : ""
      }&Vendor_GUID=${
        data["Vendor_GUID"] ? data["Vendor_GUID"] : ""
      }&Services_Category=${
        data["Service_Category_GUID"] ? data["Service_Category_GUID"] : ""
      }`
    );
  }
  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filteredStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "2quoEXxHT1d4cf033-6d84-4f90-a5ec-d8782d44774d"
      );
      this.ServiceTypeList = sysData.filter((item) =>
        [
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        ].includes(item["PARENT_GUID"])
      );
      this.filtered_service_category.next(
        sysData.filter((item) =>
          [
            "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
            "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
            "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
          ].includes(item["PARAMETER_GUID"])
        )
      );
      this.BoatTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );

      if (this.BoatTypeList) this.filtered_boat_type.next(this.BoatTypeList);

      this.filtered_service_type.next(this.ServiceTypeList);
      this.filtered_status.next(filteredStatus);
      this.filterFormGroup.controls["type_Filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "PARAMETER_NAME",
            this.ServiceTypeList,
            this.filtered_service_type
          );
        });
    }
  }

  loadCrewData(url: string, callback: Function = null) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"];
          this.AllData = res["Data"];
          if (callback) {
            callback && callback(this);
          } else {
            this.applySearchValueFilter(this);
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
  applySearchValueFilter(that) {
    const company = new Set();
    const planner = new Set();
    const vessel = new Set();
    that.AllData.map((_item) => {
      if (_item["Planner_GUID"]) planner.add(_item["Planner_GUID"]);
      if (_item["Principal_GUID"]) company.add(_item["Principal_GUID"]);
      if (_item["Vessel_GUID"]) vessel.add(_item["Vessel_GUID"]);
    });
    console.log(company, planner, vessel);
    //COMPANY filter
    that.CompanyList = that.AllCompanyList.filter((_item) =>
      company.has(_item["COMPANY_GUID"])
    );
    that.PlannerList = that.AllPlannerList.filter((_item) =>
      planner.has(_item["GUID"])
    );
    that.VesselList = that.AllVesselList.filter((_item) =>
      vessel.has(_item["VESSEL_GUID"])
    );

    that.filtered_principal.next(that.CompanyList);
    that.filtered_vessel.next(that.VesselList);
    that.filtered_planner.next(that.PlannerList);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Vendor.xlsx");
  }

  loadSelectableData(that) {
    const payload = {
      module: ["vessels", "planner", "company"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          that.AllCompanyList = res["Data"].company;
          that.AllPlannerList = res["Data"].planner;
          that.AllVesselList = res["Data"].vessels;

          that.applySearchValueFilter(that);

          that.filterFormGroup.controls["principal_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "COMPANY_NAME",
                that.PrincipalList,
                that.filtered_principal
              );
            });
          //Vessel filter

          that.filterFormGroup.controls["vessel_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "VESSEL_NAME",
                that.VesselList,
                that.filtered_vessel
              );
            });

          //Planner

          that.filterFormGroup.controls["planner_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "REF_NUM",
                that.PlannerList,
                that.filtered_planner
              );
            });
          that.loading = false;
        } else {
          that.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        that.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
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

  SaveData(data: object, IsEdit: boolean) {
    console.log(data);
    const dialogRef = this.dialog.open(UpdateFollowupComponent, {
      width: "70%",
      disableClose: true,
    });

    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.componentInstance.Services_Data = data;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }

  clearFilter() {
    this.filterFormGroup.reset();
    this.filterFormGroup
      .get("Status_GUID")
      .patchValue(["ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943"]);
    this.loadCrewData(
      "followup/get?Status_GUID=ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943"
    );
  }

  ChangeStatus(data: object) {
    console.log("data", data);
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            Folloup_Guid: data["Folloup_Guid"],
            DELETED_BY: "ADMIN",
          };
          this.api.PostDataService(`followup/delete`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["ACTIVE_STATUS"]
                );
                this.common.ShowMessage(
                  "Follow-up deleted successfully",
                  "notify-success",
                  3000
                );
              } else {
                this.common.ShowMessage(res["Message"], "notify-error", 6000);
              }
            },
            (error) => {
              this.common.ShowMessage(error["Message"], "notify-error", 6000);
            }
          );
        }
      });
  }
  getBoatType(boatTypeId) {
    if (boatTypeId) {
      const boatType = this.BoatTypeList.find(
        (_item) => _item["PARAMETER_GUID"] === boatTypeId
      );
      return boatType ? `(${boatType["PARAMETER_NAME"]})` : "";
    }
    return "";
  }
  public sortData(sort: Sort) {
    const data = this.dataSource["data"].slice();
    if (!sort.active || sort.direction === "") {
      this.dataSource["data"] = data;
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "Services_Category":
          return this.compare(
            a["Service_Category_Name"],
            b["Service_Category_Name"],
            isAsc
          );
        case "Service_Type":
          return this.compare(
            a["Service_Type_Name"],
            b["Service_Type_Name"],
            isAsc
          );
        case "Vendor_Name":
          return this.compare(a["Vendor_Name"], b["Vendor_Name"], isAsc);
        case "Svc_Quantity":
          return this.compare(a["Svc_Quantity"], b["Svc_Quantity"], isAsc);
        case "Currency_Name":
          return this.compare(a["Currency_Name"], b["Currency_Name"], isAsc);
        case "Svc_Amount":
          return this.compare(a["Svc_Amount"], b["Svc_Amount"], isAsc);
        case "Status_GUID":
          return this.compare(a["Status_GUID"], b["Status_GUID"], isAsc);
        case "Service_Date":
          return this.compare(
            new Date(
              a["Boat_Date"] ? a["Boat_Date"] : a["Service_date"]
            ).getTime(),
            new Date(
              b["Boat_Date"] ? b["Boat_Date"] : b["Service_date"]
            ).getTime(),
            isAsc
          );
        default:
          return 0;
      }
    });
    this.dataSource["data"] = sortedData;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    let x = typeof a === "string" ? a.toLowerCase() : a;
    let y = typeof b === "string" ? b.toLowerCase() : b;
    if (x < y) {
      return isAsc ? -1 : 1;
    }
    if (x > y) {
      return isAsc ? 1 : -1;
    }
    return 0;
  }
  ngOnDestroy() {}
}
