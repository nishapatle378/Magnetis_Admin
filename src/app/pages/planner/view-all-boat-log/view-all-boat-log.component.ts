import {
  Component,
  Input,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, of, ReplaySubject, Subject } from "rxjs";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { BoatsPopupComponent } from "../boats-popup/boats-popup.component";
import { takeUntil } from "rxjs/operators";

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import * as _moment from "moment";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import * as moment from "moment";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY-MM-DD",
  },
  display: {
    dateInput: "DD MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM-YYYY",
  },
};

@Component({
  selector: "fury-view-all-boat-log",
  templateUrl: "./view-all-boat-log.component.html",
  styleUrls: ["./view-all-boat-log.component.scss"],
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
export class ViewAllBoatLogComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "Vessel_Name", visible: true, name: "Vessel Name" },
    //  { property: 'Megentis_Ref_Number', visible: true, name: 'Megentis Ref Number' },
    { property: "Planner_Name", visible: true, name: "Planner" },
    { property: "Planner_Pic", visible: true, name: "Planner PIC" },
    { property: "Boat_Date", visible: true, name: "Date" },
    { property: "Boat_Type_Name", visible: true, name: "Type" },
    { property: "Boat_Vendor_Name", visible: true, name: "Vendor" },
    { property: "Boat_From_Name", visible: true, name: "From" },
    { property: "Boat_To_Name", visible: true, name: "To" },
    { property: "Boat_Alongside", visible: true, name: "Alongside" },
    { property: "Boat_Cast_Off", visible: true, name: "Cast Off" },
    { property: "Trip_Type", visible: true, name: "Trip Type" },
    { property: "Currency_Name", visible: true, name: "Currency" },
    { property: "Boat_RATE", visible: true, name: "Total Amount" },
    { property: "Remarks", visible: true, name: "Remarks" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  dataSourceBoatCount = [];
  AllData: Array<object> = [];
  loading = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterFormGroup: FormGroup;
  // loading: boolean = true;
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  PlannerList: Array<object> = [];
  BoatTypeList: Array<object> = [];
  BoatVendorList: Array<object> = [];
  PicList: Array<object> = [];

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
  public filtered_boat_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle("Boat Log");
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.loadBoatData("boat/get-all", this.loadSelectableData);
    this.getSysData();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      VESSEL_GUID: [""],
      FROM_DATE: [""],
      TO_DATE: [""],
      PLANNER_GUID: [""],
      BOAT_TYPE: [""],
      BOAT_VENDOR: [""],
      principal_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
      // type_Filter: [""],
      vendor_Filter: [""],
      Trip_Type: [""],
      AGENT_GUID: [""],
      pic_Filter: [""],
    });
    let thisVar = this;
    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((principal) => {
        console.log(principal);
        if (principal) {
          thisVar.filtered_vessel.next(
            thisVar.VesselList.filter(
              (_vessel) => _vessel["COMPANY_GUID"] === principal
            )
          );
        } else {
          thisVar.filtered_vessel.next(thisVar.VesselList);
        }
      });
    this.filterFormGroup.get("pic_Filter").valueChanges.subscribe((pic) => {
      this.onFilterPicChange(pic, this.PicList, this.filtered_pic);
    });
  }
  protected onFilterPicChange(
    search: any,
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
      (s) =>
        `${s["USER_FIRST_NAME"]} ${s["USER_MIDDLE_NAME"]} ${s["USER_LAST_NAME"]}`
          .toLowerCase()
          .indexOf(search) > -1
    );
    fiteredList.next(filter);
  }
  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.loadBoatData("boat/get-all", () => this.fetchBoatCountData());
  }
  onClickSubmit(data) {
    this.loading = true;
    const from_date = data.FROM_DATE
      ? _moment(data.FROM_DATE).format("YYYY-MM-DD")
      : "";
    const to_date = data.TO_DATE
      ? _moment(data.TO_DATE).format("YYYY-MM-DD")
      : "";
    const url = `boat/get-all?principle_guid=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&from_date=${from_date}&to_date=${to_date}&vessel=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&type=${data.BOAT_TYPE ? data.BOAT_TYPE : ""}&status=${
      data.PLAN_STATUS_GUID ? data.PLAN_STATUS_GUID : ""
    }&planner=${data.PLANNER_GUID ? data.PLANNER_GUID : ""}&vendor=${
      data.BOAT_VENDOR ? data.BOAT_VENDOR : ""
    }&trip_type=${data.Trip_Type != null ? data.Trip_Type : ""}&Planner_PIC=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }`;
    const counturl = `boat/count-by-type?principle_guid=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&from_date=${from_date}&to_date=${to_date}&vessel=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&type=${data.BOAT_TYPE ? data.BOAT_TYPE : ""}&status=${
      data.PLAN_STATUS_GUID ? data.PLAN_STATUS_GUID : ""
    }&planner=${data.PLANNER_GUID ? data.PLANNER_GUID : ""}&vendor=${
      data.BOAT_VENDOR ? data.BOAT_VENDOR : ""
    }&trip_type=${data.Trip_Type != null ? data.Trip_Type : ""}&Planner_PIC=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }`;

    this.loadBoatData(url, () => this.fetchBoatCountData(counturl));
  }
  getPicName(guid) {
    let userName = "";
    if (guid) {
      const user = this.PicList.find((item) => item["USER_GUID"] === guid);
      if (user) {
        userName = `${user["USER_FIRST_NAME"]}${
          user["USER_MIDDLE_NAME"] ? ` ${user["USER_MIDDLE_NAME"]}` : ""
        }${user["USER_LAST_NAME"] ? ` ${user["USER_LAST_NAME"]}` : ""}`;
      }
    }
    return userName;
  }
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.BoatTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );
    }
    if (this.BoatTypeList) this.filtered_boat_type.next(this.BoatTypeList);
  }
  loadSelectableData(that) {
    const payload = {
      module: ["company", "vendors", "vessels", "planner", "users"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          //COMPANY filter
          that.PrincipalList = res["Data"].company;
          that.filtered_principal.next(res["Data"].company);
          const Agent_Guids = that.AllData.map((item) => item["AGENT_GUID"]);
          that.PicList = res["Data"].users.filter((user) =>
            Agent_Guids.includes(user["USER_GUID"])
          );
          that.filtered_pic.next(that.PicList);
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
          that.VesselList = res["Data"].vessels;
          that.filtered_vessel.next(res["Data"].vessels);
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
          //Vendor filter
          that.VendorList = res["Data"].vendors;
          that.filtered_boat_vendor.next(res["Data"].vendors);
          that.filterFormGroup.controls["vendor_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "Vendor_Name",
                that.VendorList,
                that.filtered_boat_vendor
              );
            });
          //Planner
          that.PlannerList = res["Data"].planner;
          that.filtered_planner.next(res["Data"].planner);
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
          that.fetchBoatCountData();
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
  loadBoatData(url: string, callback: Function = null) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        this.loading = false;
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"];
          this.AllData = res["Data"];
          callback && callback(this);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  exportAsExcel() {
    const exportData = this.AllData.map((_item, index) => ({
      no: index + 1,
      date: _item["Boat_Date"],
      from: _item["Boat_From_Name"],
      to: _item["Boat_To_Name"],
      boat_type: _item["Boat_Type_Name"],
      trip_type: _item["Trip_Type"] === "one-way" ? "One Way" : "Two-Way",
      vendor: _item["Vendor_Name"],
      remarks: _item["Remarks"],
      amount: _item["Boat_RATE"],
      invoice_number: "",
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      {},
      {},
      ...exportData,
    ]);
    let vesselName = [];
    this.AllData.map((_item) => {
      if (!vesselName.includes(_item["Vessel_Name"])) {
        vesselName.push(_item["Vessel_Name"]);
      }
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          `VESSEL NAME: ${vesselName.join(",")}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "No",
          "Date",
          "From",
          "To",
          "Boat Type",
          "Trip Type",
          "Vendor",
          "Remarks",
          "Amount",
          "Invoice Number",
        ],
      ],
      { origin: "A1" }
    );
    ws["!cols"] = this.fitToColumn([
      [
        { width: 20 },
        { width: 50 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 400 },
        { width: 150 },
        { width: 150 },
      ],
    ]);
    var merge = { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } };
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push(merge);

    /* save to file */
    XLSX.writeFile(wb, `Boat_Log_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }
  fetchBoatCountData(url = "boat/count-by-type") {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.dataSourceBoatCount = res["Data"];
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(BoatsPopupComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }
  ChangeStatus(data: object) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            BoatLog_GUID: data["BoatLog_GUID"],
            Services_GUID: data["Services_GUID"],
            DELETED_BY: "ADMIN",
          };
          this.api.PostDataService(`boat/delete`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["BoatLog_GUID"] != data["BoatLog_GUID"]
                );
                this.common.ShowMessage(
                  "Boat log deleted successfully",
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
  ngOnDestroy() {}
}
