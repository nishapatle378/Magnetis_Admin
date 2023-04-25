import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";
import { FormBuilder } from "@angular/forms";
import { takeUntil } from "rxjs/operators";

// import moment from 'moment';

@Component({
  selector: "fury-activity-report-list",
  templateUrl: "./activity-report-list.component.html",
  styleUrls: ["./activity-report-list.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ActivityReportListComponent implements OnInit {
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  anys: any[];
  currentRowData = false;
  @ViewChild("TABLE1") table1: ElementRef;
  @ViewChild("TABLE2") table2: ElementRef;
  loading = false;
  protected _onDestroy = new Subject<void>();
  @Input()
  columns: ListColumn[] = [
    { property: "COMPANY_NAME", visible: true, name: "Principal" },
    { property: "NO_OF_SHIPS", visible: true, name: "No of ships" },
  ] as ListColumn[];

  columns2: ListColumn[] = [
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "VESSEL_TYPE", visible: true, name: "Vessel Type" },
    { property: "VESSEL_ETA", visible: true, name: "Vessel ETA" },
    { property: "VESSEL_ETD", visible: true, name: "Vessel ETD" },
    {
      property: "VESSEL_ACTUAL_ARR",
      visible: true,
      name: "Vessel Actual Arrival",
    },
    {
      property: "VESSEL_ACTUAL_DEP",
      visible: true,
      name: "Vessel Actual Departure",
    },
  ] as ListColumn[];
  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  pageSize = 10;
  dataSourcePrincipal: MatTableDataSource<any> | null;
  dataSourceDetail: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  company_list: object[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  authGuard: AuthGuard;
  filterFormGroup: any;

  constructor(
    private api: ApiService,
    private common: CommonService,
    private titleService: Title,
    private auth: AuthGuard,
    private fb: FormBuilder
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Historical Activity Report`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  get visibleColumns2() {
    return this.columns2
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSourcePrincipal = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      VESSEL_ETA_FROM: [""],
      VESSEL_ETD_TO: [""],
      principal_Filter: [""],
    });
    this.dataSourceDetail = new MatTableDataSource();

    this.FetchAllCompany();
    this.filterFormGroup.controls["principal_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.principal_filter_List(val);
      });
  }

  ngAfterViewInit() {
    this.dataSourcePrincipal.paginator = this.paginator;
    this.dataSourcePrincipal.sort = this.sort;
    this.dataSourceDetail.paginator = this.paginator;
    this.dataSourceDetail.sort = this.sort;
  }
  onClickSubmit(filter) {}
  protected principal_filter_List(val: any) {
    if (!this.company_list) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_principal.next(this.company_list);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.company_list.filter(
      (s) => s["COMPANY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_principal.next(filter);
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

  sendReport(num: number) {}

  startDate = null;
  endDate = null;

  FilterDataStatus(company: string) {
    let url = "planner/hitorical-report";
    if (this.startDate && this.endDate) {
      url = url + "?from_date=" + this.startDate + "&to_date=" + this.endDate;
    }
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          console.log(res["Data"]);
          this.dataSourcePrincipal.data = res["Data"];
          this.dataSourceDetail.data = [];
          if (
            company &&
            this.dataSourcePrincipal.data &&
            this.dataSourcePrincipal.data.length > 0
          ) {
            this.dataSourcePrincipal.data =
              this.dataSourcePrincipal.data.filter(
                (_company) => _company["COMPANY_GUID"] == company
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

  getPlannerData(company: string) {
    let url = `planner/reports?status=20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984&principle_guid=${company}`;

    if (this.startDate && this.endDate) {
      url = url + "from_date=" + this.startDate + "&to_date=" + this.endDate;
    }
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          console.log(res["Data"]);
          this.dataSourceDetail.data = res["Data"];
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  FetchAllCompany() {
    console.log(this.api);
    const payload = {
      module: ["company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.company_list = res["Data"].company.filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.filtered_principal.next(this.company_list);
          this.FilterDataStatus(null);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  clearFilter() {}
  ngOnDestroy() {}
}
