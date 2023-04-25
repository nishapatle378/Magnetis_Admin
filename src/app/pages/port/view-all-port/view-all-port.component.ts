import {
  AfterViewInit,
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
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditPortComponent } from "../add-edit-port/add-edit-port.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-port",
  templateUrl: "./view-all-port.component.html",
  styleUrls: ["./view-all-port.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllPortComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  @ViewChild("TABLE") table: ElementRef;
  selected = "all";
  CountryList: Array<object> = [];
  loading = true;
  protected _onDestroy = new Subject<void>();
  public filtered_country: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @Input()
  columns: ListColumn[] = [
    { property: "Port_Name", visible: true, name: "Port Name" },
    { property: "PORT_SHORT_CODE", visible: true, name: "Port Short Code" },
    {
      property: "World_port_index_number",
      visible: true,
      name: "World Port Index",
    },
    { property: "COUNTRY_NAME", visible: true, name: "Country Name" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  filterFormGroup: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
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
    this.titleService.setTitle(`Ports list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.filterFormGroup = this.fb.group({
      SEARCH: [""],
      COUNTRY: [""],
      STATUS: [1],
      country_Filter: [""],
    });
    this.dataSource = new MatTableDataSource();
    this.loadPortData("port/all?status=1", this.loadSelectableData);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Currency.xlsx");
  }
  loadSelectableData(that) {
    const payload = {
      module: ["country"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          that.CountryList = res["Data"].country;
          that.filtered_country.next(that.CountryList);
          that.filterFormGroup.controls["country_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "COUNTRY_NAME",
                that.CountryList,
                that.filtered_country
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
  // FilterDataStatus(type: string) {
  //   var data = JSON.parse(JSON.stringify(this.AllData));
  //   if (type == "Activated") {
  //     this.dataSource.data = data.filter((u: object) => u["ACTIVE_STATUS"]);
  //   } else if (type == "Deleted") {
  //     this.dataSource.data = data.filter((u: object) => !u["ACTIVE_STATUS"]);
  //   } else {
  //     this.dataSource.data = data;
  //   }
  // }

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.loadPortData("port/all?status=1");
  }
  onClickSubmit(data: any) {
    console.log(data);
    const url = `port/all?country=${data.COUNTRY ? data.COUNTRY : ""}&status=${
      data.STATUS ? data.STATUS : ""
    }&search=${data.SEARCH ? data.SEARCH : ""}`;
    this.loadPortData(url);
  }
  loadPortData(url: string, callback = null) {
    this.api.GetDataService(url).subscribe(
      (res) => {
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
  // OpenModificationInfo(data: object) {
  //   const dialogRef = this.dialog.open(ModificationInfoComponent, {
  //     disableClose: true,
  //     width: "30%",
  //   });
  //   dialogRef.componentInstance.UserData = data;

  //   dialogRef.afterClosed().subscribe((data: any) => {});
  // }
  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditPortComponent, {
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

  ngOnDestroy() {}

  ChangeStatus(data: object) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            PORT_GUID: data["PORT_GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
          };
          this.api.PostDataService(`port/update/status`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["ACTIVE_STATUS"]
                );
                this.common.ShowMessage(res["Message"], "notify-success", 3000);
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
}
