import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import * as XLSX from "xlsx";
import { ReplaySubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { Title } from "@angular/platform-browser";
import { AgentScreenComponent } from "../agent-screen/agent-screen.component";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-transport-index",
  templateUrl: "./transport-index.component.html",
  styleUrls: ["./transport-index.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TransportIndexComponent implements OnInit {
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
    { property: "Service_Date", visible: true, name: "Date" },
    { property: "Vendor_Name", visible: true, name: "Vendor" },
    { property: "Service_Type", visible: true, name: "Service Type" },
    { property: "Currency_Name", visible: true, name: "Currency" },
    { property: "Svc_Amount", visible: true, name: "Total Amount" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  dataSourceBoatCount = [];
  AllData: Array<object> = [];
  loading = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterFormGroup: FormGroup;
  // loading: boolean = true;
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

  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_service_type: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  ƒ;
  VendorList: any;
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
    this.titleService.setTitle("Transport Log");
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.loadBoatData(
      "planner/services?plan_status=ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
      this.loadSelectableData
    );
    this.getSysData();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      VESSEL_GUID: [""],
      FROM_DATE: [""],
      PLANNER_GUID: [""],
      Service_Type: [[]],
      SERVICE_VENDOR: [""],
      principal_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
      type_Filter: [""],
      vendor_Filter: [""],
      AGENT_GUID: [""],
      pic_Filter: [""],
    });
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
    this.filterFormGroup
      .get("Service_Type")
      .valueChanges.subscribe((Service_Type) => {
        const vendors = thisVar.VendorList.filter((v) =>
          Service_Type.includes(v["SERVICE_GUID"])
        );

        const uniqueVendors = new Set();
        this.filtered_vendor.next(
          vendors.filter((v) => {
            if (uniqueVendors.has(v["Vendor_GUID"])) {
              return false;
            } else {
              uniqueVendors.add(v["Vendor_GUID"]);
              return true;
            }
          })
        );
      });
    this.filterFormGroup.get("pic_Filter").valueChanges.subscribe((pic) => {
      this.onFilterPicChange(pic, this.PicList, this.filtered_pic);
    });
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
        `${s["USER_FIRST_NAME"]}${
          s["USER_MIDDLE_NAME"] ? ` ${s["USER_MIDDLE_NAME"]}` : ""
        }${s["USER_LAST_NAME"] ? ` ${s["USER_LAST_NAME"]}` : ""}`
          .toLowerCase()
          .indexOf(search) > -1
    );
    fiteredList.next(filter);
  }
  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    this.loadBoatData(
      `planner/services?plan_status=ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a`
    );
  }
  onClickSubmit(data) {
    this.loading = true;
    const from_date = data.FROM_DATE
      ? moment(data.FROM_DATE).format("YYYY-MM-DD")
      : "";
    const url = `planner/services?Principal_GUID=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&fromDate=${from_date}&Vessel_GUID=${
      data.VESSEL_GUID ? data.VESSEL_GUID : ""
    }&Service_Type=${
      data.Service_Type ? data.Service_Type.join(",") : ""
    }&plan_status=${
      data.PLANNER_GUID ? "" : "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a"
    }&Planner_GUID=${data.PLANNER_GUID ? data.PLANNER_GUID : ""}&Planner_PIC=${
      data.AGENT_GUID ? data.AGENT_GUID : ""
    }&Vendor_GUID=${data.SERVICE_VENDOR ? data.SERVICE_VENDOR : ""}`;
    this.loadBoatData(url);
  }

  getSysData() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const serviceTypeList = sysData.filter((item) =>
        [
          "llxxUZG9R1cf749e2-ab37-4023-a695-3833b004863a",
          "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
        ].includes(item["PARAMETER_GUID"])
      );
      this.filtered_service_type.next(serviceTypeList);
    }
  }
  loadSelectableData(that) {
    const payload = {
      module: ["company", "service_vendors", "vessels", "planner", "users"],
      plan_status: "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          //COMPANY filter
          that.CompanyList = res["Data"].company;
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
          //Vendor filter
          that.VendorList = res["Data"].service_vendors.filter((v) =>
            [
              "llxxUZG9R1cf749e2-ab37-4023-a695-3833b004863a",
              "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
            ].includes(v["SERVICE_GUID"])
          );

          const uniqueVendors = new Set();
          that.filtered_vendor.next(
            res["Data"].service_vendors.filter((v) => {
              if (uniqueVendors.has(v["Vendor_GUID"])) {
                return false;
              } else {
                uniqueVendors.add(v["Vendor_GUID"]);
                return true;
              }
            })
          );

          that.filterFormGroup.controls["vendor_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              const uniqueVendors = new Set();
              const uVendors = that.VendorList.filter((v) => {
                if (uniqueVendors.has(v["Vendor_GUID"])) {
                  return false;
                } else {
                  uniqueVendors.add(v["Vendor_GUID"]);
                  return true;
                }
              });
              that.onFilterChange(
                val,
                "Vendor_Name",
                uVendors,
                that.filtered_vendor
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
    console.log(search);
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
  loadBoatData(url: string, callback: Function = null) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        this.loading = false;
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

  exportAsExcel() {
    const exportData = this.AllData.map((_item, index) => ({
      no: index + 1,
      service_type: _item["Service_Type_Name"],
      date: _item["Service_date"] || "",
      quantity: _item["Svc_Quantity"],
      vendor_name: _item["Vendor_Name"],
      currency: _item["Currency_Name"],
      amount: _item["Svc_Amount"],
      remarks: _item["Remarks"],
      invoice_number: _item["Status_Name"],
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      {},
      {},
      ...exportData,
    ]);
    let vesselName = [];
    this.AllData.map((_item) => {
      if (!vesselName.includes(_item["Vessel_Name"])) {
        vesselName.push(_item["Vessel_Name"]);
      }
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          `VESSEL NAME: ${vesselName.join(",")}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "No",
          "Service Type",
          "Service Date",
          "Service Quantity",
          "Vendor Name",
          "Currency",
          "Amount",
          "Remarks",
          "Service Status",
        ],
      ],
      { origin: "A1" }
    );
    ws["!cols"] = this.fitToColumn([
      [
        { width: 20 },
        { width: 50 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 150 },
        { width: 400 },
        { width: 150 },
        { width: 150 },
      ],
    ]);
    var merge = { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } };
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push(merge);

    /* save to file */
    XLSX.writeFile(wb, `Boat_Log_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }
  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AgentScreenComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.componentInstance.serviceData = data;
    dialogRef.componentInstance.isTransport = true;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
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
          };
          this.api.PostDataService(`planner/service/delete`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                this.onClickSubmit(this.filterFormGroup.value);
                this.common.ShowMessage(
                  "Boat log deleted successfully",
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
