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
import { Observable, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditCtmComponent } from "../add-edit-ctm/add-edit-ctm.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import * as moment from "moment";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
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
  selector: "fury-ctm-index",
  templateUrl: "./ctm-index.component.html",
  styleUrls: ["./ctm-index.component.scss"],
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
export class CtmIndexComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  NewRefNumber = "";
  @ViewChild("TABLE") table: ElementRef;
  filterFormGroup: FormGroup;
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  PlannerList: Array<object> = [];
  CompanyList: Array<object> = [];
  StatusList: Array<object> = [];
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
  public filtered_Status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @Input()
  columns: ListColumn[] = [
    { property: "CTM_REF", visible: true, name: "REF" },
    { property: "Port_Name", visible: true, name: "Port" },
    { property: "COMPANY_NAME", visible: true, name: "Principal" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel" },
    { property: "VESSEL_ETA", visible: true, name: "ETA" },
    { property: "PLANNER_PIC", visible: true, name: "Planner PIC" },
    { property: "Planner_Status", visible: true, name: "Planner Status" },
    { property: "CTM_PIC", visible: true, name: "CTM PIC" },
    { property: "CTM_STATUS", visible: true, name: "CTM Status" },
    { property: "Planned_Amount", visible: true, name: "Planned Amount USD" },
    { property: "USD_Amount_Due", visible: true, name: "Amount USD" },
    { property: "USD_Amount_Sgd", visible: true, name: "Amount SGD" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

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
    this.titleService.setTitle(`CTM list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }
  checkDateWithin48Hours(date: string, status, planStatus) {
    if (
      date &&
      status !== "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c" &&
      planStatus != "20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984"
    ) {
      let hours = moment(date).diff(moment(), "hours");
      return hours > 0 && hours < 48 ? true : false;
    } else {
      return false;
    }
  }
  checkDateIsInPast(date, status, planStatus) {
    if (
      date &&
      status !== "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c" &&
      planStatus != "20pQd3MaDd7ea9dd2-e2e7-42b1-9614-b51669e87984"
    ) {
      let hours = moment(date).diff(moment(), "hours");
      return hours < 0 ? true : false;
    } else {
      return false;
    }
  }
  compareAmounts(plannedAmount: number, actualAmount: number) {
    plannedAmount = plannedAmount ? plannedAmount : 0;
    actualAmount = actualAmount ? actualAmount : 0;
    if (plannedAmount != actualAmount) {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      VESSEL_GUID: [""],
      PLANNER_GUID: [""],
      PRINCIPAL_GUID: [""],
      principal_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
      STATUS_GUID: [""],
      FROM_DATE: [""],
      TO_DATE: [""],
      AGENT_GUID: [""],
      pic_Filter: [""],
    });

    this.getSysData();

    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((principal) => {
        this.filtered_vessel.next(
          this.VesselList.filter(
            (_vessel) => _vessel["COMPANY_GUID"] === principal
          )
        );
      });
    this.filterFormGroup.get("VESSEL_GUID").valueChanges.subscribe((vessel) => {
      this.filtered_planner.next(
        this.PlannerList.filter(
          (_planner) => _planner["VESSEL_GUID"] === vessel
        )
      );
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
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.StatusList = sysData.filter(
        (item: any) =>
          item["PARENT_GUID"] == "z1BBOlFQO4b013698-988e-47c3-abdc-c4c521e1359c"
      );
      this.filtered_Status.next(this.StatusList);

      const status = this.StatusList.map(
        (_item) => _item["PARAMETER_GUID"]
      ).filter(
        (_status) =>
          ![
            "MoZq47qzm78c0f2d9-aaa5-4315-adb0-0bbba66126d7",
            "kh2buGgqda2d18f85-ede8-4169-9e86-b2f731eb92f3",
            "9PovKGXNF7bdbfcce-4d0a-413a-bcf3-d9e4f5dad2c0",
            "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c",
          ].includes(_status)
      );
      this.filterFormGroup.get("STATUS_GUID").setValue(status);
    }
    this.FetchAllData();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  clearFilter() {
    this.filterFormGroup.reset();

    const status = this.StatusList.map(
      (_item) => _item["PARAMETER_GUID"]
    ).filter(
      (_status) =>
        ![
          "MoZq47qzm78c0f2d9-aaa5-4315-adb0-0bbba66126d7",
          "kh2buGgqda2d18f85-ede8-4169-9e86-b2f731eb92f3",
          "9PovKGXNF7bdbfcce-4d0a-413a-bcf3-d9e4f5dad2c0",
          "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c",
        ].includes(_status)
    );
    this.filterFormGroup.get("STATUS_GUID").setValue(status);
    const url = `support-ctm/get-all?status=${status.join(",")}`;
    this.FetchAllData(url);
  }

  onClickSubmit(data) {
    const from = data.FROM_DATE
      ? moment(data.FROM_DATE).format("YYYY-MM-DD")
      : "";
    const to = data.TO_DATE ? moment(data.TO_DATE).format("YYYY-MM-DD") : "";
    const url = `support-ctm/get-all?status=${
      data.STATUS_GUID ? data.STATUS_GUID.join(",") : ""
    }&planner=${data.PLANNER_GUID ? data.PLANNER_GUID : ""}&vessel=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&fromDate=${from}&toDate=${to}&Planner_PIC=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }&principal=${data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""}`;
    this.FetchAllData(url);
  }
  // Is it possible to have the DatePicker directly call this event handler?

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Vendor.xlsx");
  }

  FetchAllData(url = null) {
    if (url === null) {
      const status = this.StatusList.map(
        (_item) => _item["PARAMETER_GUID"]
      ).filter(
        (_status) =>
          ![
            "MoZq47qzm78c0f2d9-aaa5-4315-adb0-0bbba66126d7",
            "kh2buGgqda2d18f85-ede8-4169-9e86-b2f731eb92f3",
            "9PovKGXNF7bdbfcce-4d0a-413a-bcf3-d9e4f5dad2c0",
            "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c",
          ].includes(_status)
      );
      url = `support-ctm/get-all?status=${status.join(",")}`;
    }
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"];
          this.AllData = res["Data"];
          if (this.CompanyList.length === 0) {
            this.loadFilterdata(this);
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
  loadFilterdata(that) {
    const payload = {
      module: ["users", "vessels", "planner", "company"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          //COMPANY filter
          that.PrincipalList = res["Data"].company;
          const Agent_Guids = that.AllData.map((item) => item["AGENT_GUID"]);
          that.PicList = res["Data"].users.filter((user) =>
            Agent_Guids.includes(user["USER_GUID"])
          );
          that.filtered_pic.next(that.PicList);
          that.filtered_principal.next(res["Data"].company);
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
        } else {
          that.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        that.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditCtmComponent, {
      width: "100%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.Services_GUID = data["Service_GUID"];
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
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
            CTM_GUID: data["CTM_GUID"],
            Planner_GUID: data["Planner_GUID"],
            Service_GUID: data["Service_GUID"],
          };
          this.api.DeleteDataService(`support-ctm/delete`, post).subscribe(
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
