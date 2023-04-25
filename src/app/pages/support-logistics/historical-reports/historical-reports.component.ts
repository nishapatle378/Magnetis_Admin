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
    { property: "Log_Ref", visible: true, name: "REF" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel" },
    { property: "Description_Name", visible: true, name: "Description" },
    { property: "Destination_Name", visible: true, name: "Destination" },
    { property: "Remarks", visible: true, name: "Remarks" },
    { property: "Status_GUID", visible: true, name: "Status" },
    { property: "Date_Closed", visible: true, name: "Date Closed" },
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
      VESSEL_GUID: [""],
      DATE_FROM: [""],
      DATE_TO: [""],
      DESTINATION: [""],
      vessel_Filter: [""],
      principal_Filter: [""],
    });
    this.FetchAllSupportLogistics();
    this.getSysTemParameter();
    let thisVar = this;
    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((principal) => {
        thisVar.filtered_vessel.next(
          thisVar.VesselList.filter(
            (_vessel) => _vessel["COMPANY_GUID"] === principal
          )
        );
      });
  }
  getSysTemParameter() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.destinationList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] ==
            "qoyVliwes8a2fb2de-7459-4e41-a307-1a35494bcfbd" &&
          item["ACTIVE_STATUS"]
      );

      this.filtered_destination.next(this.destinationList);
    }
  }
  onClickSubmit(data) {
    console.log(data);
    const url = `support-logistic/get-all?destination=${data.DESTINATION}&status=WdVGpZR7Z94675122-4e9c-40d7-80dd-e01f2893400b&vessel=${data.VESSEL_GUID}&fromDate=${data.DATE_FROM}&toDate=${data.DATE_TO}`;
    this.FetchAllSupportLogistics(url);
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
  FetchAllSupportLogistics(
    url = `support-logistic/get-all?status=WdVGpZR7Z94675122-4e9c-40d7-80dd-e01f2893400b`
  ) {
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
    //PostDataService
    const payload = {
      module: ["vessels", "company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.VesselList = res["Data"].vessels;

          // this.filtered_vessel.next(this.VesselList);
          this.filterFormGroup.controls["vessel_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_vessel_List(val);
            });

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

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.FetchAllSupportLogistics();
  }
}
