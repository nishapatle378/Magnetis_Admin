import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import * as XLSX from "xlsx";
import {
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  DateAdapter,
} from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { PlannerViewComponent } from "../planner-view/planner-view.component";
import { Title } from "@angular/platform-browser";
import * as moment from "moment";
import Swal from "sweetalert2";
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
  selector: "fury-fda-list",
  templateUrl: "./fda-list.component.html",
  styleUrls: ["./fda-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class FdaListComponent implements OnInit {
  @Input()
  columns: ListColumn[] = [
    { property: "REF_NUM", visible: true, name: "Planner Ref Num" },
    { property: "COMPANY_NAME", visible: true, name: "Principal Name" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel" },
    { property: "VESSEL_ACTUAL_ARR", visible: true, name: "Date Arrival" },
    { property: "VESSEL_ACTUAL_DEP", visible: true, name: "Date Departure" },
    { property: "AMOUNT", visible: true, name: "Amount" },
    { property: "Invoice_Status_Name", visible: true, name: "Invoice Status" },
    { property: "Invoice_Number", visible: true, name: "Invoice Number" },
    { property: "ACTION", visible: true, name: "Action" },
  ] as ListColumn[];

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("TABLE") table: ElementRef;
  protected _onDestroy = new Subject<void>();

  CompanyList: Array<object> = [];
  VesselList: Array<object> = [];
  PlannerList: Array<object> = [];
  InvoiceStatus: Array<object> = [];
  StatusList: Array<object> = [];
  AllCompanyList = [];
  AllPlannerList = [];
  AllVesselList = [];

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_invoice_status: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  filterFormGroup = null;
  loading = false;
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
    this.titleService.setTitle(`FDA list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      VESSEL_GUID: [""],
      PLANNER_GUID: [""],
      INVOICE_NUMBER: [""],
      INVOICE_STATUS: [["UzQzLVk8G88296ce7-5d4a-4b74-a510-6d95f76b79df"]],
      PLAN_STATUS_GUID: [["20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984"]],
      DATE_FROM: [""],
      DATE_TO: [""],
      TYPE: ["", Validators.required],
      status_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
    });
    this.FetchAllOpenPlanner();
    this.getSysData();
    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((PRINCIPAL_GUID) => {
        this.filtered_vessel.next(
          this.VesselList.filter(
            (item) => item["COMPANY_GUID"] === PRINCIPAL_GUID
          )
        );
      });
    this.filterFormGroup
      .get("VESSEL_GUID")
      .valueChanges.subscribe((VESSEL_GUID) => {
        if (VESSEL_GUID) {
          this.loadPlannerData(VESSEL_GUID);
        }
      });
    this.filterFormGroup.controls["status_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.StatusList,
          this.filtered_status
        );
      });
    this.filterFormGroup.controls["planner_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "REF_NUM",
          this.PlannerList,
          this.filtered_planner
        );
      });
    this.filterFormGroup.controls["vessel_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "VESSEL_NAME",
          this.VesselList,
          this.filtered_vessel
        );
      });
  }
  handleUnInvoice(plan_id) {
    Swal.fire({
      template: "#my-template",
      title: "Alert",
      text: "Are you sure want to uninvoice this plan?",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: "Close",
      confirmButtonText: "Yes",
      backdrop: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.api
          .PostDataService(`fda/uninvoice`, { plan_id: plan_id })
          .subscribe(
            (res) => {
              if (res["Status"] === 200) {
                this.onClickSubmit(this.filterFormGroup.value);
                this.common.ShowMessage(
                  "Uninvoice successfully",
                  "notify-success",
                  6000
                );
              } else {
                this.common.ShowMessage(res["message"], "notify-error", 6000);
              }
            },
            (error) => {
              this.common.ShowMessage(error["message"], "notify-error", 6000);
            }
          );
      }
    });
  }
  protected onFilterChange(
    search: any,
    property: string,
    list: Array<any>,
    fiteredList: ReplaySubject<Array<object>>
  ) {
    console.log(search, property, list);
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
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.StatusList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "9vgAPneFve77687e4-26bb-4564-b17b-3b42d1d9ee96"
      );
      this.InvoiceStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "I0KyRHItI5656e7c9-db98-41b7-a78d-695109ebce71"
      );
    }

    if (this.StatusList) this.filtered_status.next(this.StatusList);
    if (this.InvoiceStatus)
      this.filtered_invoice_status.next(this.InvoiceStatus);
  }

  loadPlannerData(Vessel_Guid) {
    this.api.GetDataService(`planner/all?Vessel_Guid=${Vessel_Guid}`).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.PlannerList = res["Data"];
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
  getInvoiceCount(row) {
    if (row.Print_Options === 0) {
      return (
        row.Missing_Invoice_Count -
        row.Missing_Invoice_Boat_Count +
        row.Missing_Invoice_Boat_wo_Count
      );
    } else {
      return row.Missing_Invoice_Count;
    }
  }
  onClickSubmit(data) {
    this.loading = true;
    const eta = data.DATE_FROM
      ? moment(data.DATE_FROM).format("YYYY-MM-DD")
      : "";
    const etd = data.DATE_TO ? moment(data.DATE_TO).format("YYYY-MM-DD") : "";
    const url = `fda/get-all?principle_guid=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&vessel_ata=${eta}&vessel_atd=${etd}&vessel=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&planner=${data.PLANNER_GUID ? data.PLANNER_GUID : ""}&status=${
      data.PLAN_STATUS_GUID && data.PLAN_STATUS_GUID != "all"
        ? data.PLAN_STATUS_GUID
        : ""
    }&invoice_status=${
      data.INVOICE_STATUS && data.INVOICE_STATUS != "all"
        ? data.INVOICE_STATUS
        : ""
    }&search=${data.SEARCH ? data.SEARCH : ""}&agent=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }&vessel_type=${data.VESSEL_TYPE ? data.VESSEL_TYPE : ""}&invoice_no=${
      data.INVOICE_NUMBER ? data.INVOICE_NUMBER : ""
    }`;

    this.FetchAllOpenPlanner(url);
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Users.xlsx");
  }
  ViewPlanner(data: object) {
    const dialogRef = this.dialog.open(PlannerViewComponent, {
      width: "100%",
      maxHeight: "100%",
      disableClose: true,
    });
    dialogRef.componentInstance.plannerData = data;
    dialogRef.afterClosed().subscribe((data: any) => {});
  }
  FetchAllOpenPlanner(
    url = `fda/get-all?status=20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984&invoice_status=UzQzLVk8G88296ce7-5d4a-4b74-a510-6d95f76b79df`
  ) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        this.loading = false;
        if (res["Status"] === 200) {
          if (res["Data"]) {
            this.AllData = res["Data"];
            this.dataSource.data = res["Data"];
            if (!this.CompanyList.length) {
              this.loadSelectableData();
            } else {
              //this.applySearchValueFilter(this);
            }
          }
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.loading = false;
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  loadSelectableData() {
    const payload = {
      module: ["company", "vessels", "planner"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.AllCompanyList = res["Data"].company;
          this.AllPlannerList = res["Data"].planner;
          this.AllVesselList = res["Data"].vessels;

          this.applySearchValueFilter(this);
          this.loading = false;
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  public sortData(sort: Sort) {
    const sortableData = this.dataSource["data"];
    const data = sortableData.slice();
    if (!sort.active || sort.direction === "") {
      this.dataSource["data"] = data;
      return;
    }
    console.log("Apply sort", sort.active, sort.direction);
    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "VESSEL_ACTUAL_ARR":
          return this.compare(
            new Date(a["VESSEL_ACTUAL_ARR"]).getTime(),
            new Date(b["VESSEL_ACTUAL_ARR"]).getTime(),
            isAsc
          );
        case "VESSEL_ACTUAL_DEP":
          return this.compare(
            new Date(a["VESSEL_ACTUAL_DEP"]).getTime(),
            new Date(b["VESSEL_ACTUAL_DEP"]).getTime(),
            isAsc
          );
        default:
          return this.compare(a[sort.active], b[sort.active], isAsc);
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

  applySearchValueFilter(that) {
    const company = new Set();
    const planner = new Set();
    const vessel = new Set();
    console.log(that.AllData);
    that.AllData.map((_item) => {
      if (_item["GUID"]) planner.add(_item["GUID"]);
      if (_item["PRINCIPAL_GUID"]) company.add(_item["PRINCIPAL_GUID"]);
      if (_item["VESSEL_GUID"]) vessel.add(_item["VESSEL_GUID"]);
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
  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.filterFormGroup
      .get("PLAN_STATUS_GUID")
      .patchValue(["20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984"]);
    this.filterFormGroup
      .get("INVOICE_STATUS")
      .patchValue(["UzQzLVk8G88296ce7-5d4a-4b74-a510-6d95f76b79df"]);
    this.FetchAllOpenPlanner();
  }
}
