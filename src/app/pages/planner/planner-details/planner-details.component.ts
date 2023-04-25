import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import * as XLSX from "xlsx";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";

import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BoatsPopupComponent } from "../boats-popup/boats-popup.component";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { AgentScreenComponent } from "../agent-screen/agent-screen.component";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import { AddEditPlannerComponent } from "../add-edit-planner/add-edit-planner.component";

import { AddEditCtmComponent } from "../../support-ctm/add-edit-ctm/add-edit-ctm.component";
import { CrewUpdateComponent } from "../crew-update/crew-update.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import Swal from "sweetalert2";
import * as moment from "moment";
import { UpdateServiceStatusComponent } from "../update-service-status/update-service-status.component";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

export const MY_FORMATS = {
  parse: {
    dateInput: "L",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "fury-planner-details",
  templateUrl: "./planner-details.component.html",
  styleUrls: ["./planner-details.component.scss"],
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
export class PlannerDetailsComponent implements OnInit {
  systemParameterSummery: Array<object> = [];
  plannerData = null;
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  @ViewChild("TABLE") table: ElementRef;
  pageSize = 10;
  selected = "all";
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  allServiceList: Array<object> = [];
  allServiceSummery: Array<object> = [];
  serviceTypeFilter: string = null;
  vendorList: Array<object> = [];
  serviceTypeList: Array<object> = [];
  BoatTypeList: Array<object> = [];
  serviceSummery = {
    Agency_Fee: 0,
    Boat: 0,
    CTM: 0,
    Crew_Handling: { Crew_On_Actual: 0, Crew_Off_Actual: 0 },
    CTM_Summery: {
      Amount_Recieved: 0,
      Applicable_Exchange: 0,
      Billable: 0,
      CTM_GUID: "",
      Status_Name: "",
      Total_Amount: 0,
      USD_Amount_Due: 0,
      Vendor_Name: "",
    },
  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  protected _onDestroy = new Subject<void>();
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_service_type: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_boat_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  firstFormGroup: FormGroup;
  @Input()
  columns: ListColumn[] = [
    { property: "Services_Category", visible: true, name: "Services Category" },
    { property: "Service_Type", visible: true, name: "Service Type" },
    { property: "Service_Date", visible: true, name: "Service Date" },
    { property: "Svc_Quantity", visible: true, name: "Quantity" },
    { property: "Vendor_Name", visible: true, name: "Vendor" },
    { property: "Currency_Name", visible: true, name: "Currency" },
    { property: "Svc_Amount", visible: true, name: "Amount" },
    { property: "Remarks", visible: true, name: "Remark" },
    { property: "Status_GUID", visible: true, name: "Status" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private router: Router,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.titleService.setTitle(`Planner ref - ${id}`);
  }
  public sortData(sort: Sort) {
    const sortableData = this.dataSource["data"];
    const data = sortableData.slice();
    if (!sort.active || sort.direction === "") {
      this.dataSource["data"] = data;
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "Services_Category":
          return this.compare(
            a["Service_Category_Name"],
            b["Service_Category_Name"],
            isAsc
          );
        case "Service_Type":
          return this.compare(
            a["Service_Type_Name"],
            b["Service_Type_Name"],
            isAsc
          );
        case "Vendor_Name":
          return this.compare(a["Vendor_Name"], b["Vendor_Name"], isAsc);
        case "Svc_Quantity":
          return this.compare(a["Svc_Quantity"], b["Svc_Quantity"], isAsc);
        case "Currency_Name":
          return this.compare(a["Currency_Name"], b["Currency_Name"], isAsc);
        case "Svc_Amount":
          return this.compare(a["Svc_Amount"], b["Svc_Amount"], isAsc);
        case "Status_GUID":
          return this.compare(a["Status_GUID"], b["Status_GUID"], isAsc);
        case "Service_Date":
          return this.compare(
            new Date(
              a["Boat_Date"] ? a["Boat_Date"] : a["Service_date"]
            ).getTime(),
            new Date(
              b["Boat_Date"] ? b["Boat_Date"] : b["Service_date"]
            ).getTime(),
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
  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.firstFormGroup = this.fb.group({
      Status_GUID: [""],
      Service_Type: [""],
      Service_Vendor: [""],
      vendor_Filter: [""],
      service_type_filter: [""],
      BOAT_TYPE: [""],
    });
    this.getPlanner();
    this.fetchServiceType();
    this.firstFormGroup
      .get("Service_Type")
      .valueChanges.subscribe((Service_Type) => {
        if (Service_Type) {
          const uniqueVendor = new Set();
          const vendorList = this.vendorList.filter((_item) => {
            if (
              uniqueVendor.has(_item["Vendor_GUID"]) ||
              (Service_Type !== null && _item["SERVICE_GUID"] !== Service_Type)
            ) {
              return false;
            } else {
              uniqueVendor.add(_item["Vendor_GUID"]);
              return true;
            }
          });
          console.log("Service_Type", Service_Type, vendorList);
          this.filtered_vendor.next(vendorList);
        }
      });
  }

  getPlanner() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) {
      let fullUrl = "planner/by-ref?ref_number=" + id;
      this.api.GetDataService(fullUrl).subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.plannerData = res["Data"];
            if (this.plannerData && this.plannerData["GUID"]) {
              this.getAllServices(this.plannerData["GUID"]);
            }
          } else {
            this.common.ShowMessage(res["message"], "notify-error", 6000);
          }
        },
        (error) => {
          this.common.ShowMessage(error["message"], "notify-error", 6000);
        }
      );
    } else {
      console.log("Planner ID is required");
    }
  }
  filterServicesByType(service_type: string) {
    this.dataSource["data"] = this.allServiceList.filter(
      (_item) => _item["Service_Type"] === service_type
    );
    this.firstFormGroup.get("Service_Type").patchValue(service_type);
    this.serviceTypeFilter = service_type;
  }
  clearFilter() {
    this.firstFormGroup.reset();
    this.dataSource["data"] = this.allServiceList;
  }
  onClickSubmit(data) {
    let services = [...this.allServiceList];
    if (this.serviceTypeFilter) {
      services = services.filter(
        (item) => item["Service_Type"] === this.serviceTypeFilter
      );
    }
    if (data["Service_Type"] && data["Service_Type"] !== "") {
      services = services.filter(
        (item) => item["Service_Type"] === data["Service_Type"]
      );
    }
    if (
      data["Status_GUID"] &&
      data["Status_GUID"] !== "" &&
      data["Status_GUID"] !== "all"
    ) {
      services = services.filter(
        (item) => item["Status_GUID"] === data["Status_GUID"]
      );
    }
    if (data["Service_Vendor"] && data["Service_Vendor"] !== "") {
      services = services.filter(
        (item) => item["Vendor_GUID"] === data["Service_Vendor"]
      );
    }
    if (data["BOAT_TYPE"] && data["BOAT_TYPE"] !== "") {
      services = services.filter(
        (item) => item["Boat_Type_GUID"] === data["BOAT_TYPE"]
      );
    }
    this.dataSource["data"] = services;
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }
  validateNo(event): boolean {
    var keyCode = event.which ? event.which : event.keyCode;
    var str = event.target.value;
    if (str.length == 0 && event.keyCode == 46) return false;
    if (str.indexOf(".") >= 0 && event.keyCode == 46) return false;
    if (keyCode != 46 && keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
    return true;
  }

  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filteredStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "2quoEXxHT1d4cf033-6d84-4f90-a5ec-d8782d44774d"
      );
      this.serviceTypeList = sysData.filter((item) =>
        [
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        ].includes(item["PARENT_GUID"])
      );
      this.BoatTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );

      if (this.BoatTypeList) this.filtered_boat_type.next(this.BoatTypeList);

      this.filtered_service_type.next(this.serviceTypeList);
      this.filtered_status.next(filteredStatus);
      this.firstFormGroup.controls["service_type_filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "PARAMETER_NAME",
            this.serviceTypeList,
            this.filtered_service_type
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

  getAllServices(GUID: string) {
    let fullUrl = "planner/service/get-by-plan/" + GUID;
    this.api.GetDataService(fullUrl).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          const data = res["Data"].map((_service, index) => {
            _service["index"] = index;
            _service["Service_date"] = _service["Boat_Date"]
              ? _service["Boat_Date"]
              : _service["Service_date"];
            return _service;
          });
          this.allServiceList = data.sort((a, b) => {
            const isAsc = false;
            return this.compare(
              new Date(a["Service_date"]).getTime(),
              new Date(b["Service_date"]).getTime(),
              isAsc
            );
          });

          let filteredServices = this.allServiceList.filter(
            (_item) =>
              ![
                "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99",
                "JCpugXSwB7a89deff-4cce-47ea-ae1d-795d1383d175",
                "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10",
                "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4",
              ].includes(_item["Service_Type"])
          );
          let hash = Object.create(null);
          let result = [];
          filteredServices.forEach(function (o) {
            if (!hash[o["Service_Type"]]) {
              hash[o["Service_Type"]] = {
                Service_Type: o["Service_Type"],
                Service_Type_Name: o["Service_Type_Name"],
                Svc_Quantity: 0,
              };
              result.push(hash[o["Service_Type"]]);
            }
            hash[o["Service_Type"]].Svc_Quantity += +o["Svc_Quantity"];
          });

          this.allServiceSummery = result;
          this.onClickSubmit(this.firstFormGroup.value);
          this.getServiceSummery(GUID);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  getServiceSummery(planner: string) {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filtered_crew_category = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Hr5H0YaIH50f0572b-82d6-4e7a-ad24-f9062ae234b2"
      );
      let crew_type = {
        joiners: [],
        off_signer: [],
        cancel_joiner: [],
        cancel_off_signer: [],
      };
      for (let index in filtered_crew_category) {
        let item = filtered_crew_category[index];
        if (
          item["PARAMETER_NAME"].includes("Join") &&
          !item["PARAMETER_NAME"].includes("Cancel")
        ) {
          crew_type.joiners.push(item["PARAMETER_GUID"]);
        }
        if (
          item["PARAMETER_NAME"].includes("Off") &&
          !item["PARAMETER_NAME"].includes("Cancel")
        ) {
          crew_type.off_signer.push(item["PARAMETER_GUID"]);
        }
        if (
          item["PARAMETER_NAME"].includes("Join") &&
          item["PARAMETER_NAME"].includes("Cancel")
        ) {
          crew_type.cancel_joiner.push(item["PARAMETER_GUID"]);
        }
        if (
          item["PARAMETER_NAME"].includes("Off") &&
          item["PARAMETER_NAME"].includes("Cancel")
        ) {
          crew_type.cancel_off_signer.push(item["PARAMETER_GUID"]);
        }
      }
      const payload = {
        crew_type,
        planner,
      };
      this.api.PostDataService(`planner/service/summery`, payload).subscribe(
        (res) => {
          if (res["Status"] === 200) {
            const systemParameterSummery = [];
            this.serviceSummery = res["Data"];
            this.serviceTypeList.map((_item) => {
              const service = {};
              service["PARAMETER_GUID"] = _item["PARAMETER_GUID"];
              service["Service_Type_Name"] = _item["PARAMETER_NAME"];
              service["SORT_ORDER"] = _item["SORT_ORDER"];
              service["custom"] = true;
              if (
                _item["PARAMETER_GUID"] ===
                "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
              ) {
                //CTM
                service["VALUE"] = {
                  CTM_Summery: this.serviceSummery["CTM_Summery"],
                  CTM: this.serviceSummery["CTM"],
                  CTM_Currency: this.serviceSummery["CTM_Currency"],
                };
              } else if (
                _item["PARAMETER_GUID"] ===
                "JCpugXSwB7a89deff-4cce-47ea-ae1d-795d1383d175"
              ) {
                //Agency Fee
                service["VALUE"] = {
                  Agency_Fee: this.serviceSummery["Agency_Fee"],
                  Agency_Fee_Currency:
                    this.serviceSummery["Agency_Fee_Currency"],
                };
              } else if (
                _item["PARAMETER_GUID"] ===
                "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
              ) {
                //Crew Handling
                service["VALUE"] = this.serviceSummery["Crew_Handling"];
              } else if (
                _item["PARAMETER_GUID"] ===
                "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
              ) {
                //Boats
                service["VALUE"] = this.serviceSummery["Boat"];
              } else {
                //Other
                const item = this.allServiceSummery.find(
                  (m) => m["Service_Type"] === _item["PARAMETER_GUID"]
                );
                if (item) {
                  service["VALUE"] = item["Svc_Quantity"];
                } else {
                  service["VALUE"] = null;
                }
                service["custom"] = false;
              }
              systemParameterSummery.push(service);
            });

            this.systemParameterSummery = systemParameterSummery
              .filter((_item) => _item["VALUE"])
              .sort(function (a, b) {
                return a["SORT_ORDER"] - b["SORT_ORDER"];
              });
            if (this.vendorList.length === 0) {
              this.loadSelectableData();
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
  }
  getBoatType(boatTypeId) {
    if (boatTypeId) {
      const boatType = this.BoatTypeList.find(
        (_item) => _item["PARAMETER_GUID"] === boatTypeId
      );
      return boatType ? `(${boatType["PARAMETER_NAME"]})` : "";
    }
    return "";
  }
  showAddService(data: object) {
    const dialogRef = this.dialog.open(AgentScreenComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
      data: data,
    });
    dialogRef.componentInstance.serviceData = data;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getAllServices(this.plannerData["GUID"]);
      }
    });
  }
  EditPlanner() {
    const dialogRef = this.dialog.open(AddEditPlannerComponent, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });
    dialogRef.componentInstance.UserData = this.plannerData;
    dialogRef.componentInstance.IsEdit = true;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getPlanner();
      }
    });
  }
  numberWithCommas(x) {
    if (x) {
      return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
    return 0;
  }
  // closePlanner() {
  //   Swal.fire({
  //     template: "#my-template",
  //     title:
  //       "Do you want to change the status of all services also or keep open?",
  //     text: "",
  //     icon: "warning",
  //     showCancelButton: true,
  //     showDenyButton: true,
  //     confirmButtonColor: "#1976d2",
  //     denyButtonColor: "#1976d2",
  //     cancelButtonColor: "#d33",
  //     denyButtonText: `Change Service Status`,
  //     confirmButtonText: "Yes, Close Plan",
  //     backdrop: false,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const payload = {
  //         plannerId: this.plannerData["GUID"],
  //       };
  //       this.api.PostDataService("planner/close", payload).subscribe(
  //         (res) => {
  //           if (res["Status"] === 200) {
  //             this.common.ShowMessage(res["Message"], "notify-success", 6000);
  //             this.getPlanner();
  //           } else {
  //             this.common.ShowMessage(res["Message"], "notify-error", 6000);
  //           }
  //         },
  //         (error) => {
  //           this.common.ShowMessage(error["Message"], "notify-error", 6000);
  //         }
  //       );
  //     } else if (result.isDenied) {
  //       console.log("change status");
  //       this.handleServiceStatus();
  //     }
  //   });
  // }
  handleServiceStatus() {
    if (
      null == this.plannerData["VESSEL_ACTUAL_DEP"] ||
      "" == this.plannerData["VESSEL_ACTUAL_DEP"] ||
      null == this.plannerData["VESSEL_ACTUAL_ARR"] ||
      "" == this.plannerData["VESSEL_ACTUAL_ARR"]
    ) {
      Swal.fire({
        template: "#my-template",
        title:
          "Please update Vessel Actual Arrival/Departure before closing this plan",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#d33",
        cancelButtonText: `Close`,
        backdrop: false,
      });
      return;
    }
    const dialogRef = this.dialog.open(UpdateServiceStatusComponent, {
      width: "50%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.services = this.systemParameterSummery.map(
      (item, index) => {
        item["index"] = index;
        return item;
      }
    );
    dialogRef.componentInstance.planner = this.plannerData["GUID"];
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        window.location.reload();
      }
    });
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["service_vendors"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.vendorList = res["Data"].service_vendors;
          const uniqueVendor = new Set();
          this.filtered_vendor.next(
            this.vendorList.filter((_item) => {
              if (uniqueVendor.has(_item["Vendor_GUID"])) {
                return false;
              } else {
                uniqueVendor.add(_item["Vendor_GUID"]);
                return true;
              }
            })
          );
          this.firstFormGroup.controls["vendor_Filter"].valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((val) => {
              const uniqueVendor = new Set();
              const vendors = this.vendorList.filter((_item) => {
                if (uniqueVendor.has(_item["Vendor_GUID"])) {
                  return false;
                } else {
                  uniqueVendor.add(_item["Vendor_GUID"]);
                  return true;
                }
              });
              this.onFilterChange(
                val,
                "Vendor_Name",
                vendors,
                this.filtered_vendor
              );
            });
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  editService(data, isEdit, readOnly = false) {
    console.log("editService", data);
    if (
      data["Service_Type"] == "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
    ) {
      //Open Crew Modal
      const dialogRef = this.dialog.open(CrewUpdateComponent, {
        width: "70%",
        minHeight: "80%",
        disableClose: true,
      });
      dialogRef.componentInstance.Services_Data = data;
      dialogRef.componentInstance.Remarks = data.Remarks;
      dialogRef.componentInstance.IsEdit = isEdit;
      dialogRef.componentInstance.ReadOnly = readOnly;
      dialogRef.afterClosed().subscribe((data: any) => {
        if (data) {
          this.getAllServices(this.plannerData["GUID"]);
        }
      });
    } else if (
      data["Service_Type"] == "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
    ) {
      //Open Boat Modal
      const dialogRef = this.dialog.open(BoatsPopupComponent, {
        width: "60%",
        minHeight: "80%",
        disableClose: true,
      });
      dialogRef.componentInstance.Services_GUID = data.Services_GUID;
      dialogRef.componentInstance.IsEdit = isEdit;
      dialogRef.componentInstance.ReadOnly = readOnly;
      dialogRef.afterClosed().subscribe((data: any) => {
        if (data) {
          this.getAllServices(this.plannerData["GUID"]);
        }
      });
    } else if (
      data["Service_Type"] == "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
    ) {
      this.router.navigate([
        `/support-ctm/edit-service/${data.Services_GUID}`,
        {},
      ]);
    } else {
      const dialogRef = this.dialog.open(AgentScreenComponent, {
        width: "50%",
        maxHeight: "80%",
        minHeight: "80%",
        disableClose: true,
      });
      dialogRef.componentInstance.serviceData = data;
      dialogRef.componentInstance.IsEdit = isEdit;
      dialogRef.componentInstance.ReadOnly = readOnly;
      dialogRef.afterClosed().subscribe((data: any) => {
        if (data) {
          this.getAllServices(this.plannerData["GUID"]);
        }
      });
    }
  }

  exportAsExcel() {
    const exportData = this.allServiceList.map((_item, index) => ({
      no: index + 1,
      service_category_name: _item["Service_Category_Name"],
      service_type_name: _item["Service_Type_Name"],
      service_date: _item["Service_date"]
        ? moment(_item["Service_date"]).format("DD MMM YYYY HH:mm")
        : "",
      svc_quantity: _item["Svc_Quantity"],
      vendor_name: _item["Vendor_Name"],
      currency_name: _item["Currency_Name"],
      svc_amount: _item["Svc_Amount"],
      remarks: _item["Remarks"],
      status_name: _item["Status_Name"],
    }));
    console.log(exportData);
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      {},
      {},
      {},
      ...exportData,
    ]);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [`Planner Details`, "", "", "", "", "", "", "", "", ""],
        [
          `Magentis Ref Number`,
          `Port`,
          `Principal`,
          "Vessel",
          "Principal Appointment ref",
          "ETA",
          "Actual Arrival",
          "ETD",
          "Actual Departure",
          "Appointment Type",
          "Crew Change",
        ],
        [
          this.plannerData["REF_NUM"],
          this.plannerData["Port_Name"],
          this.plannerData["COMPANY_NAME"],
          this.plannerData["VESSEL_NAME"],
          this.plannerData["APPOINTMENT_REF"],
          this.plannerData["VESSEL_ETA"],
          this.plannerData["VESSEL_ACTUAL_ARR"],
          this.plannerData["VESSEL_ETD"],
          this.plannerData["VESSEL_ACTUAL_DEP"],
          this.plannerData["APPOINTMENT_TYPE_NAME"],
          this.plannerData["Crew_Change"],
        ],
        [
          "No",
          "Service Category",
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
        { width: 150 },
      ],
    ]);
    var merge = { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } };
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push(merge);

    /* save to file */
    XLSX.writeFile(wb, `Planner_Details_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }
  printAmount(row) {
    if (
      row["Service_Type"] === "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99" &&
      row["Svc_Currency_GUID"] ===
        "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
    ) {
      return (row.USD_Amount_Due || 0) * (row["Applicable_Exchange"] || 1);
    } else {
      return row.Svc_Amount || 0;
    }
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
            MODIFIED_BY: "ADMIN",
          };
          this.api.PostDataService(`planner/service/delete`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                this.getAllServices(this.plannerData["GUID"]);
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
  // filterDataStatus(type) {
  //   var data = JSON.parse(JSON.stringify(this.allServiceList));
  //   if (type == "all") {
  //     this.dataSource.data = data;
  //   } else {
  //     this.dataSource.data = data.filter(
  //       (u: object) => u["Status_GUID"] === type
  //     );
  //   }
  // }

  // CloseModal() {
  //   // this.dialogRef.close(true);
  // }
}
