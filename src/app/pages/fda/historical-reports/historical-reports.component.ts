import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
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
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { PlannerViewComponent } from "../planner-view/planner-view.component";
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
  selector: "fury-historical-reports",
  templateUrl: "./historical-reports.component.html",
  styleUrls: ["./historical-reports.component.scss"],
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
export class HistoricalReportsComponent implements OnInit {
  @Input()
  columns: ListColumn[] = [
    { property: "VESSEL_NAME", visible: true, name: "Vessel" },
    { property: "PRINCIPAL_NAME", visible: true, name: "Principal Name" },
    { property: "REF_NUM", visible: true, name: "Ref Num" },
  ] as ListColumn[];

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("TABLE") table: ElementRef;
  protected _onDestroy = new Subject<void>();

  destinationList: Array<object> = [];
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_destination: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  filterFormGroup = null;
  loading = false;
  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder
  ) {}

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      DATE_FROM: [""],
      DATE_TO: [""],
    });
    this.FetchAllClosedPlanner();
    let thisVar = this;

  }

  onClickSubmit(data) {
    console.log(data);
    const url = `planner/reports?invoice_status=5HdIlQ6Wo94d2d926-b8a6-4ed6-b909-67ae334f8ed9&vessel=${data.VESSEL_GUID}&fromDate=${data.DATE_FROM}&toDate=${data.DATE_TO}`;
    this.FetchAllClosedPlanner(url);
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
  FetchAllClosedPlanner(url = `planner/reports?invoice_status=5HdIlQ6Wo94d2d926-b8a6-4ed6-b909-67ae334f8ed9`) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          if (res["Data"]) {
            this.AllData = res["Data"];
            this.dataSource.data = res["Data"];
            if (!this.PrincipalList.length) {
              this.loadSelectableData();
            }
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
  loadSelectableData() {
    const payload = {
      module: ["company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.PrincipalList = res["Data"].company;
          this.filtered_principal.next(this.PrincipalList);
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

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.FetchAllClosedPlanner();
  }
}
