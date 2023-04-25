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
import { AddEditCtmComponent } from "../add-edit-ctm/add-edit-ctm.component";
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
  selector: "fury-historical-records",
  templateUrl: "./historical-records.component.html",
  styleUrls: ["./historical-records.component.scss"],
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
export class HistoricalRecordsComponent implements OnInit {
  @Input()
  columns: ListColumn[] = [
    { property: "DATE_DELIVERED", visible: true, name: "Date delivered" },
    { property: "AMOUNT", visible: true, name: "Amount" },
    { property: "REF_NUM", visible: true, name: "Ref Num" },
  ] as ListColumn[];

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("TABLE") table: ElementRef;
  protected _onDestroy = new Subject<void>();

  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  totalAmountDue = 0;
  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  filterFormGroup = null;
  loading = false;
  constructor(
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private dialog: MatDialog
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
      vessel_Filter: [""],
      principal_Filter: [""],
    });
    this.getReports();
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
  onClickSubmit(data) {
    const url = `support-ctm/get-all?status=8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c&vessel=${data.VESSEL_GUID}&fromDate=${data.DATE_FROM}&toDate=${data.DATE_TO}`;
    this.getReports(url);
  }
  openDetails(data) {
    const dialogRef = this.dialog.open(AddEditCtmComponent, {
      width: "100%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = true;
    dialogRef.componentInstance.readOnly = true;
    dialogRef.afterClosed().subscribe((data: any) => {});
  }
  getReports(
    url = `support-ctm/get-all?status=8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c`
  ) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          if (res["Data"]) {
            this.AllData = res["Data"];
            this.dataSource.data = res["Data"];
            this.totalAmountDue = this.AllData.reduce(
              (initial, current) => initial + current["USD_Amount_Due"],
              0
            );
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
  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Users.xlsx");
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
  }
}
