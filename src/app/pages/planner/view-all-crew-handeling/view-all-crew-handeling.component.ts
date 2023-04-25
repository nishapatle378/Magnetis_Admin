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
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";

import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/internal/operators/takeUntil";
import { CrewUpdateComponent } from "../crew-update/crew-update.component";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";
import { Title } from "@angular/platform-browser";
@Component({
  selector: "fury-view-all-crew-handeling",
  templateUrl: "./view-all-crew-handeling.component.html",
  styleUrls: ["./view-all-crew-handeling.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllCrewHandelingComponent implements OnInit {
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
    { property: "Vessel_Name", visible: true, name: "Vessel Name" },
    { property: "Planner_Name", visible: true, name: "Planner" },
    { property: "Planner_Pic", visible: true, name: "Planner PIC" },
    { property: "Planner_Pic", visible: true, name: "Planner PIC" },
    { property: "Vessel_ETA", visible: true, name: "Vessel ETA" },
    { property: "Vessel_ARR", visible: true, name: "Vessel Actual ARR" },
    {
      property: "Crew_On_Plan_Planned",
      visible: true,
      name: "Crew On Plan Planed",
    },
    {
      property: "Crew_On_Plan_Actual",
      visible: true,
      name: "Crew On Plan Actual",
    },
    {
      property: "Crew_Off_Plan_Planned",
      visible: true,
      name: "Crew On Plan Planned",
    },
    {
      property: "Crew_Off_Plan_Actual",
      visible: true,
      name: "Crew On Plan Actual",
    },
    { property: "Currency_Name", visible: true, name: "Currency" },
    { property: "Svc_Amount", visible: true, name: "Crew Total" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  dataSourceBoatCount = [];
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterFormGroup: FormGroup;
  loading: boolean = true;
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  PlannerList: Array<object> = [];
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
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private titleService: Title
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle("Crew Change log");
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
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
      AGENT_GUID: [""],
      pic_Filter: [""],
    });
    this.loadCrewData("crew/get", this.loadSelectableData);

    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((principal) => {
        this.filtered_vessel.next(
          this.VesselList.filter(
            (_vessel) => _vessel["COMPANY_GUID"] === principal
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
  onClickSubmit(data) {
    this.loadCrewData(
      `crew/get?Planner_GUID=${
        data["PLANNER_GUID"] ? data["PLANNER_GUID"] : ""
      }&Principal_Guid=${
        data["PRINCIPAL_GUID"] ? data["PRINCIPAL_GUID"] : ""
      }&Vessel_GUID=${
        data["VESSEL_GUID"] ? data["VESSEL_GUID"] : ""
      }&Planner_PIC=${data.AGENT_GUID ? data.AGENT_GUID : ""}`
    );
  }
  loadCrewData(url: string, callback: Function = null) {
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
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
        case "Vessel_Name":
          return this.compare(a["Vessel_Name"], b["Vessel_Name"], isAsc);
        case "Planner_Name":
          return this.compare(a["REF_NUM"], b["REF_NUM"], isAsc);
        case "Planner_Pic":
          return this.compare(
            this.getPicName(a["AGENT_GUID"]),
            this.getPicName(b["AGENT_GUID"]),
            isAsc
          );
        case "Crew_On_Plan_Actual":
          return this.compare(
            a["Crew_Joined_Actual"],
            b["Crew_Joined_Actual"],
            isAsc
          );
        case "Crew_Off_Plan_Planned":
          return this.compare(
            a["Crew_Not_Joined_Planned"],
            b["Crew_Not_Joined_Planned"],
            isAsc
          );
        case "Crew_Off_Plan_Actual":
          return this.compare(
            a["Crew_Not_Joined_Actual"],
            b["Crew_Not_Joined_Actual"],
            isAsc
          );
        case "Currency_Name":
          return this.compare(a["Currency_Name"], b["Currency_Name"], isAsc);
        case "Svc_Amount":
          return this.compare(a["Svc_Amount"], b["Svc_Amount"], isAsc);
        case "Vessel_ETA":
          return this.compare(
            new Date(a["VESSEL_ETA"]).getTime(),
            new Date(b["VESSEL_ETA"]).getTime(),
            isAsc
          );
        case "Vessel_ETA":
          return this.compare(
            new Date(a["VESSEL_ACTUAL_ARR"]).getTime(),
            new Date(b["VESSEL_ACTUAL_ARR"]).getTime(),
            isAsc
          );
        default:
          return 0;
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
  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Vendor.xlsx");
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
  loadSelectableData(that) {
    const payload = {
      module: ["vessels", "planner", "company", "users"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          //COMPANY filter
          that.PrincipalList = res["Data"].company;
          that.filtered_principal.next(res["Data"].company);
          const Agent_Guids = that.AllData.map((item) => item["AGENT_GUID"]);
          that.PicList = res["Data"].users.filter((user) =>
            Agent_Guids.includes(user["USER_GUID"])
          );
          that.filtered_pic.next(that.PicList);
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

  // OpenModificationInfo(data: object) {
  //   const dialogRef = this.dialog.open(ModificationInfoComponent, {
  //     disableClose: true,
  //     width: "30%",
  //   });
  //   dialogRef.componentInstance.UserData = data;

  //   dialogRef.afterClosed().subscribe((data: any) => {});
  // }
  SaveData(data: object, IsEdit: boolean) {
    console.log(data);
    const dialogRef = this.dialog.open(CrewUpdateComponent, {
      width: "70%",
      disableClose: true,
    });

    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.componentInstance.Services_Data = data;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }

  clearFilter() {
    this.filterFormGroup.reset();
    this.loadCrewData("crew/get");
  }

  ChangeStatus(data: object) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            Services_GUID: data["Services_GUID"],
            DELETED_BY: "ADMIN",
          };
          this.api.PostDataService(`crew/delete`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["ACTIVE_STATUS"]
                );
                this.common.ShowMessage(
                  "Crew log deleted successfully",
                  "notify-success",
                  3000
                );
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

  ngOnDestroy() {}
}
