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
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";
import { map, startWith, takeUntil } from "rxjs/operators";

import { Title } from "@angular/platform-browser";
// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditPlannerComponent } from "../add-edit-planner/add-edit-planner.component";

import { PlannerDetailsComponent } from "../planner-details/planner-details.component";
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
import * as _moment from "moment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
  selector: "fury-view-all-planner",
  templateUrl: "./view-all-planner.component.html",
  styleUrls: ["./view-all-planner.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
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
export class ViewAllPlannerComponent implements OnInit {
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
    { property: "REF_NUM", visible: true, name: "Ref Num" },
    { property: "Port_Name", visible: true, name: "Port" },
    { property: "PRINCIPAL_NAME", visible: true, name: "Principal" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "VESSEL_TYPE", visible: true, name: "Vessel TYPE" },
    { property: "APPOINTMENT_TYPE", visible: true, name: "Appointment TYPE" },
    { property: "PRINCIPAL_REF", visible: true, name: "Principal Ref" },
    { property: "VESSEL_ETA", visible: true, name: "ETA" },
    { property: "VESSEL_ETD", visible: true, name: "ETD" },
    { property: "VESSEL_ACTUAL_ARR", visible: true, name: "ARR" },
    { property: "VESSEL_ACTUAL_DEP", visible: true, name: "DEPT" },
    { property: "AGENT_GUID", visible: true, name: "AGENT_GUID" },
    { property: "STATUS", visible: true, name: "Status" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  authGuard: any;
  filterFormGroup: FormGroup;
  loading: boolean = true;
  PortList: Array<object> = [];
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  PicList: Array<object> = [];
  StatusList: Array<object> = [];
  VesselTypeList: Array<object> = [];
  sys_params: Array<object> = [];
  protected _onDestroy = new Subject<void>();
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vesselType: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle("Planner list");
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.FetchAllPlanner();
    this.filterFormGroup = this.fb.group({
      SEARCH: [""],
      PORT_GUID: [""],
      PRINCIPAL_GUID: [""],
      VESSEL_GUID: [""],
      VESSEL_ETA: [""],
      VESSEL_ETD: [""],
      VESSEL_TYPE: [""],
      DEPARTED_STATUS: ["all"],
      PLAN_STATUS_GUID: ["ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a"],
      AGENT_GUID: [""],
      port_Filter: [""],
      vessel_Filter: [""],
      principal_Filter: [""],
      pic_Filter: [""],
    });
    this.getSysData();
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
    this.filterFormGroup.get("pic_Filter").valueChanges.subscribe((pic) => {
      this.onFilterPicChange(pic, this.PicList, this.filtered_pic);
    });
    this.filterFormGroup.controls["VESSEL_TYPE"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((VESSEL_TYPE) => {
        thisVar.filtered_vessel.next(
          thisVar.VesselList.filter(
            (_vessel) => _vessel["VESSEL_TYPE"] === VESSEL_TYPE
          )
        );
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
  protected filter_StatusList(val: any) {
    if (!this.StatusList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_status.next(this.StatusList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.StatusList.filter(
      (s) => s["PARAMETER_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_status.next(filter);
  }
  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    this.sys_params = sysData;
    if (sysData) {
      this.StatusList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "9vgAPneFve77687e4-26bb-4564-b17b-3b42d1d9ee96"
      );
      this.VesselTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "GuxFqphkd698108f1-4739-455a-8335-8dda5ca5dadf"
      );
    }
    if (this.VesselTypeList) this.filtered_vesselType.next(this.VesselTypeList);
    if (this.StatusList) this.filtered_status.next(this.StatusList);
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["users", "ports", "vessels", "company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          const Agent_Guids = this.AllData.map((item) => item["AGENT_GUID"]);
          this.PicList = res["Data"].users.filter((user) =>
            Agent_Guids.includes(user["USER_GUID"])
          );
          this.filtered_pic.next(this.PicList);

          this.VesselList = res["Data"].vessels;

          this.filtered_vessel.next(this.VesselList);
          this.filterFormGroup.controls["vessel_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_vessel_List(val);
            });

          this.PortList = res["Data"].ports;
          this.filtered_port.next(this.PortList);
          this.filterFormGroup.controls["port_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.filter_List(val);
            });

          this.PrincipalList = res["Data"].company;
          this.filtered_principal.next(this.PrincipalList);
          this.filterFormGroup.controls["principal_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              this.principal_filter_List(val);
            });
          this.loading = false;
          this.fetchCrewDetails();
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
  protected filter_List(val: any) {
    if (!this.PortList) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_port.next(this.PortList);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.PortList.filter(
      (s) => s["Port_Name"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_port.next(filter);
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
    XLSX.writeFile(wb, "Users.xlsx");
  }
  getCTMStatus(status) {
    const statusName = this.sys_params.find(
      (_item) => _item["PARAMETER_GUID"] === status
    );
    if (statusName) {
      return statusName["PARAMETER_NAME"];
    } else {
      return "";
    }
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
  // filter() {}
  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();

    this.filterFormGroup
      .get("PLAN_STATUS_GUID")
      .patchValue("ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a");
    this.onClickSubmit(this.filterFormGroup.value);
    // this.api.GetDataService("planner/reports").subscribe(
    //   (res) => {
    //     this.loading = false;
    //     if (res["Status"] === 200) {
    //       this.dataSource.data = res["Data"];
    //       this.AllData = res["Data"];
    //     } else {
    //       this.common.ShowMessage(res["message"], "notify-error", 6000);
    //     }
    //   },
    //   (error) => {
    //     this.loading = false;
    //     this.common.ShowMessage(error["message"], "notify-error", 6000);
    //   }
    // );
  }

  onClickSubmit(data) {
    this.loading = true;
    const eta = data.VESSEL_ETA
      ? _moment(data.VESSEL_ETA).format("YYYY-MM-DD")
      : "";
    const etd = data.VESSEL_ETD
      ? _moment(data.VESSEL_ETD).format("YYYY-MM-DD")
      : "";
    const url = `planner/reports?principle_guid=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&vessel_eta=${eta}&vessel_etd=${etd}&vessel=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&port=${data.PORT_GUID ? data.PORT_GUID : ""}&status=${
      data.PLAN_STATUS_GUID && data.PLAN_STATUS_GUID != "all"
        ? data.PLAN_STATUS_GUID
        : ""
    }&search=${data.SEARCH ? data.SEARCH : ""}&agent=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }&vessel_type=${data.VESSEL_TYPE ? data.VESSEL_TYPE : ""}&departed=${data.DEPARTED_STATUS}`;
    this.api.GetDataService(url).subscribe(
      (res) => {
        this.loading = false;
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"];
          this.AllData = res["Data"];
          this.fetchCrewDetails();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.loading = false;
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  onEndDateChange() {}
  FetchAllPlanner() {
    this.api
      .GetDataService(
        "planner/reports?status=ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a"
      )
      .subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.dataSource.data = res["Data"];
            this.AllData = res["Data"];
            this.loadSelectableData();
          } else {
            this.common.ShowMessage(res["message"], "notify-error", 6000);
          }
        },
        (error) => {
          this.common.ShowMessage(error["message"], "notify-error", 6000);
        }
      );
  }
  fetchCrewDetails() {
    const planIds = this.AllData.map((item) => item["GUID"]);
    if (planIds.length) {
      const payload = { plannerIds: planIds };
      this.api.PostDataService("planner/crew/details", payload).subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.AllData = this.AllData.map((item) => {
              let crew = res["Data"].find(
                (_item) => _item["Planner_GUID"] === item["GUID"]
              );
              if (crew) {
                item["crew"] = crew;
              } else {
                item["crew"] = null;
              }
              return item;
            });
            console.log(this.AllData);
          } else {
            this.common.ShowMessage(res["message"], "notify-error", 6000);
          }
        },
        (error) => {
          this.common.ShowMessage(error["message"], "notify-error", 6000);
        }
      );
    }
  }
  printCrewDetail(crew) {
    if (crew) {
      return `Crew Joined Actual : ${crew["Crew_Joined_Actual"] || 0}
      Crew Joined Planned : ${crew["Crew_Joined_Planned"] || 0}
      Crew Not Joined Actual : ${crew["Crew_Not_Joined_Actual"] || 0}
      Crew Not Joined Planned : ${crew["Crew_Not_Joined_Planned"] || 0}`;
    } else {
      return "Crew details not available";
    }
  }
  Save(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditPlannerComponent, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });
    dialogRef.componentInstance.UserData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }

  // showAgent(data: object){
  //   const dialogRef = this.dialog.open(AgentScreenComponent, {
  //     width: '50%',
  //     maxHeight: '80%',
  //     disableClose: true,
  //     data: data
  //   });
  //   dialogRef.componentInstance.UserData = data;
  //   dialogRef.afterClosed().subscribe((data: any) => {
  //     if(data){
  //       this.FetchAllPlanner();
  //     }
  //   });
  // }

  showPlannerDetails(data: object) {
    const dialogRef = this.dialog.open(PlannerDetailsComponent, {
      width: "100%",
      maxHeight: "100%",
      disableClose: true,
      data: data,
    });
    dialogRef.componentInstance.plannerData = data;
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log(data, "planner close");
      if (data) {
        this.FetchAllPlanner();
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
            GUID: data["GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
            DELETED_BY: "ADMIN",
          };
          this.api.PostDataService(`planner/update/status`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["ACTIVE_STATUS"]
                );
                this.common.ShowMessage(
                  "Planner deleted successfully",
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
}
