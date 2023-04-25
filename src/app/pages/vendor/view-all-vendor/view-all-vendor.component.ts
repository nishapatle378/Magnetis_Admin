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

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditVendorComponent } from "../add-edit-vendor/add-edit-vendor.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-vendor",
  templateUrl: "./view-all-vendor.component.html",
  styleUrls: ["./view-all-vendor.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllVendorComponent implements OnInit {
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
    { property: "Vendor_Name", visible: true, name: "Vendor Name" },
    { property: "Vendor_Address", visible: true, name: "Vendor Address" },
    { property: "Vendor_Contact1", visible: true, name: "Vendor Contact1" },
    { property: "EMAIL_ID1", visible: true, name: "Vendor Email1" },
    { property: "PHONE_NO1", visible: true, name: "Vendor Phone1" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  loading: Boolean = false;
  filterFormGroup: FormGroup;
  serviceTypeList: Array<object> = [];
  PortList: Array<object> = [];

  protected _onDestroy = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  public filtered_service: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
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
    this.titleService.setTitle(`Vendor list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      SEARCH: [""],
      VENDOR_SERVICE: [""],
      service_Filter: [""],
      Vendor_Port: [""],
      port_Filter: [""],
    });
    this.loadSelectableData();

    this.fetchServiceType();
  }
  onClickSubmit(data) {
    this.loading = true;
    const url = `vendor/get-all?search=${
      data["SEARCH"] ? data["SEARCH"] : ""
    }&service=${data["VENDOR_SERVICE"] ? data["VENDOR_SERVICE"] : ""}&port=${
      data["Vendor_Port"] ? data["Vendor_Port"] : ""
    }`;
    this.FetchAllData(url);
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["ports"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.PortList = res["Data"].ports;
          this.filtered_port.next(this.PortList);
          this.filterFormGroup.controls["port_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.onFilterChange(
                val,
                "Port_Name",
                this.PortList,
                this.filtered_port
              );
            });
          this.FetchAllData();
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
  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.serviceTypeList = sysData.filter((item) =>
        [
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        ].includes(item["PARENT_GUID"])
      );
      this.filtered_service.next(this.serviceTypeList);
      this.filterFormGroup.controls["service_Filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "PARAMETER_NAME",
            this.serviceTypeList,
            this.filtered_service
          );
        });
    }
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
    XLSX.writeFile(wb, "Vendor.xlsx");
  }

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.FetchAllData();
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

  FetchAllData(url = "vendor/get-all") {
    this.api.GetDataService(url).subscribe(
      (res) => {
        this.loading = false;
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.AllData = res["Data"];
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
    const dialogRef = this.dialog.open(AddEditVendorComponent, {
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
          const payload = {
            Vendor_GUID: data["Vendor_GUID"],
          };
          this.api.PostDataService(`vendor/delete`, payload).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["Vendor_GUID"] !== data["Vendor_GUID"]
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
