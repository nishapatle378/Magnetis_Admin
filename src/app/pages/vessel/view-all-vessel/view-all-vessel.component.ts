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
import { map, startWith, takeUntil } from "rxjs/operators";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditVesselComponent } from "../add-edit-vessel/add-edit-vessel.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-vessel",
  templateUrl: "./view-all-vessel.component.html",
  styleUrls: ["./view-all-vessel.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllVesselComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  @ViewChild("TABLE") table: ElementRef;
  CompanyList: Array<object> = [];
  VesselTypeList: Array<object> = [];
  loading = true;
  protected _onDestroy = new Subject<void>();
  public filtered_company: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vesselType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @Input()
  columns: ListColumn[] = [
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "SHORT_NAME", visible: true, name: "Short Name" },
    { property: "VESSEL_TYPE_NAME", visible: true, name: "Vessel Type" },
    { property: "FLAG_NAME", visible: true, name: "Flag Id" },
    { property: "IMO_NUMBER", visible: true, name: "IMO No" },
    { property: "PORT_NAME", visible: true, name: "Port of Registry" },
    { property: "Call_Sign", visible: true, name: "Call Sign" },
    { property: "EMAIL_ID1", visible: true, name: "Email ID-1" },
    { property: "PHONE_NO1", visible: true, name: "Phone No-1" },
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
    private titleService: Title
    ,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Vessel list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.filterFormGroup = this.fb.group({
      SEARCH: [""],
      COMPANY_GUID: [""],
      STATUS: ["1"],
      VESSEL_TYPE: [""],
      principal_Filter: [""],
      vesselType_Filter: [""],
    });
    this.dataSource = new MatTableDataSource();
    this.loadVesselData("vessel/all?status=1", this.loadSelectableData);
    this.getSysData();
    this.filterFormGroup.controls["vesselType_Filter"].valueChanges
    .pipe(takeUntil(this._onDestroy))
    .subscribe((val) => {
      this.vessel_filter_List(val);
    });
  }
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.VesselTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "GuxFqphkd698108f1-4739-455a-8335-8dda5ca5dadf"
      );
    }
    if (this.VesselTypeList) this.filtered_vesselType.next(this.VesselTypeList);
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
    XLSX.writeFile(wb, "Vessel.xlsx");
  }
  loadSelectableData(that) {
    //PostDataService
    const payload = {
      module: ["company"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          that.CompanyList = res["Data"].company;
          that.filtered_company.next(that.CompanyList);
          that.filterFormGroup.controls["principal_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.principal_filter_List(val);
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
  protected principal_filter_List(val: any) {
    if (!this.CompanyList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_company.next(this.CompanyList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.CompanyList.filter(
      (s) => s["COMPANY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_company.next(filter);
  }
  protected vessel_filter_List(val: any) {
    if (!this.VesselTypeList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_vesselType.next(this.VesselTypeList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.VesselTypeList.filter(
      (s) => s["PARAMETER_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_vesselType.next(filter);
  }

  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.loadVesselData("vessel/all?status=1");
  }
  onClickSubmit(data: any) {
    const url = `vessel/all?company=${
      data.COMPANY_GUID ? data.COMPANY_GUID : ""
    }&type=${data.VESSEL_TYPE ? data.VESSEL_TYPE : ""}&status=${
      data.STATUS ? data.STATUS : ""
    }&search=${data.SEARCH ? data.SEARCH : ""}`;
    this.loadVesselData(url);
  }
  loadVesselData(url: string, callback = null) {
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

  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditVesselComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.loadVesselData("vessel/all");
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
            VESSEL_GUID: data["VESSEL_GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
          };
          this.api.PostDataService(`vessel/update/status`, post).subscribe(
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
