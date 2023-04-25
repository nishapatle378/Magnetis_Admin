import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { SendReportComponent } from "../send-report/send-report.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-reports",
  templateUrl: "./view-all-reports.component.html",
  styleUrls: ["./view-all-reports.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllReportsComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  @ViewChild("TABLE1") table1: ElementRef;
  @ViewChild("TABLE2") table2: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "VESSEL_TYPE", visible: true, name: "Vessel Type" },
    { property: "VESSEL_ACTUAL_ARR", visible: true, name: "Actual Arrival" },
    { property: "VESSEL_ETD", visible: true, name: "ETD" },
    { property: "AGENT_GUID", visible: true, name: "PIC" },
  ] as ListColumn[];

  columns2: ListColumn[] = [
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "VESSEL_TYPE", visible: true, name: "Vessel Type" },
    { property: "VESSEL_ETA", visible: true, name: "Vessel ETA" },
    { property: "VESSEL_ETD", visible: true, name: "Vessel ETD" },
    { property: "AGENT_GUID", visible: true, name: "PIC" },
  ] as ListColumn[];

  filterFormGroup: FormGroup;
  pageSize = 10;
  dataSourceAtPort: MatTableDataSource<any> | null;
  dataSourceToArrive: MatTableDataSource<any> | null;
  AllDataAtPort: Array<object> = [];
  AllDataToArrive: Array<object> = [];
  loading = false;
  protected _onDestroy = new Subject<void>();

  PrincipalList: Array<object> = [];

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @ViewChild("firstPaginator", { static: true }) paginator: MatPaginator;
  @ViewChild("secondPaginator", { static: true }) paginator2: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort, { static: true }) sort2: MatSort;
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
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.PrincipalList = res["Data"].company;
          this.filtered_principal.next(this.PrincipalList);
          this.filterFormGroup.controls["principal_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.principal_filter_List(val);
            });
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
  protected principal_filter_List(val: any) {
    if (!this.PrincipalList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_principal.next(this.PrincipalList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.PrincipalList.filter(
      (s) => s["COMPANY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_principal.next(filter);
  }

  get visibleColumns2() {
    return this.columns2
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  sortDataAtPort(sort: Sort) {
    const data = this.dataSourceAtPort.data.slice();
    if (!sort.active || sort.direction === "") {
      this.dataSourceAtPort.data = data;
      return;
    }

    this.dataSourceAtPort.data = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "VESSEL_ACTUAL_ARR":
          return this.compare(
            new Date(a["VESSEL_ACTUAL_ARR"]).getTime(),
            new Date(b["VESSEL_ACTUAL_ARR"]).getTime(),
            isAsc
          );
        case "VESSEL_ETD":
          return this.compare(
            new Date(a["VESSEL_ETD"]).getTime(),
            new Date(b["VESSEL_ETD"]).getTime(),
            isAsc
          );

        default:
          return 0;
      }
    });
  }
  sortDataToArrive(sort: Sort) {
    const data = this.dataSourceToArrive.data.slice();
    if (!sort.active || sort.direction === "") {
      this.dataSourceToArrive.data = data;
      return;
    }

    this.dataSourceToArrive.data = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "VESSEL_ETA":
          return this.compare(
            new Date(a["VESSEL_ETA"]).getTime(),
            new Date(b["VESSEL_ETA"]).getTime(),
            isAsc
          );
        case "VESSEL_ETD":
          return this.compare(
            new Date(a["VESSEL_ETD"]).getTime(),
            new Date(b["VESSEL_ETD"]).getTime(),
            isAsc
          );
        default:
          return 0;
      }
    });
  }
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */
  ngOnInit() {
    this.dataSourceAtPort = new MatTableDataSource();
    this.dataSourceToArrive = new MatTableDataSource();
    this.FetchAllPlanner();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      principal_Filter: [""],
      ETA_FROM: [""],
      ETA_TO: [""],
    });
  }

  ngAfterViewInit() {
    this.dataSourceAtPort.paginator = this.paginator;
    this.dataSourceAtPort.sort = this.sort;
    this.dataSourceToArrive.paginator = this.paginator2;
    this.dataSourceToArrive.sort = this.sort2;
  }

  exportAsExcel(num: number) {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      num == 1 ? this.table1.nativeElement : this.table2.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    /* save to file */
    XLSX.writeFile(wb, "Report.xlsx");
  }

  sendReport(num: number) {
    if (this.dataSourceAtPort.data.length == 0) {
      this.common.ShowMessage(
        "Records not found to send report",
        "notify-error",
        6000
      );
      return;
    }
    const dialogRef = this.dialog.open(SendReportComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.table = this.dataSourceAtPort.data;
    dialogRef.componentInstance.num = num;

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        // this.FetchAllPlanner();
      }
    });
  }

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.FetchAllPlanner();
  }
  onClickSubmit(data) {
    this.FetchAllPlanner(
      `planner/activity/reports?status=ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a&principal=${
        data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
      }&eta_from=${data.ETA_FROM ? data.ETA_FROM : ""}&eta_to=${
        data.ETA_TO ? data.ETA_TO : ""
      }`
    );
  }

  FetchAllPlanner(
    url = "planner/activity/reports?status=ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a"
  ) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.AllDataAtPort = res["Data"];
          this.dataSourceAtPort.data = res["Data"]["vesselAtPort"];
          this.dataSourceToArrive.data = res["Data"]["vesselToArrive"];
          //this.loadSelectableData();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  ngOnDestroy() {}
}
