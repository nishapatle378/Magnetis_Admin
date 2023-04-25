import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import { ReplaySubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import * as XLSX from "xlsx";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";
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
  selector: "fury-vendor-invoice",
  templateUrl: "./vendor-invoice.component.html",
  styleUrls: ["./vendor-invoice.component.scss"],
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
export class VendorInvoiceComponent implements OnInit {
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  dataSourceBoatCount = [];
  AllData: Array<object> = [];
  BoatTypeList: Array<object> = [];

  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "Planner", visible: true, name: "Planner Ref" },
    { property: "Principal", visible: true, name: "Principal Name" },
    { property: "Vessel", visible: true, name: "Vessel Name" },
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

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterFormGroup: FormGroup;
  loading: boolean = true;
  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  VendorList: Array<object> = [];
  PlannerList: Array<object> = [];
  ServiceTypeList: Array<object> = [];
  ServiceCategoryList: Array<object> = [];
  VendorWiseCount: Array<any> = [];

  AllCompanyList: Array<object> = [];
  AllVendorList: Array<object> = [];
  AllPlannerList: Array<object> = [];
  AllVesselList: Array<object> = [];

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
  public filtered_boat_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_service_type: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_service_category: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  VesselWiseCount: unknown[];
  selectedVendor: any;
  selectedVessel: any;
  AllInvoiceData: any;
  authGuard: AuthGuard;

  constructor(
    private api: ApiService,
    private common: CommonService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Vendor invoice report`);
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
      Invoice_Status: ["0"],
      Status_GUID: [
        [
          "ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943",
          "DgamvTPATe125f1eb-40b5-4a4c-8a3e-994e3e9e9222",
        ],
      ],
      Service_Type_GUID: [""],
      DateFrom: [""],
      DateTo: [""],
      Service_Category_GUID: [""],
      Vendor_GUID: [""],
      principal_Filter: [""],
      planner_Filter: [""],
      vessel_Filter: [""],
      type_Filter: [""],
      category_Filter: [""],
      vendor_Filter: [""],
    });
    const plannerId = this.route.snapshot.paramMap.get("plannerId");

    this.loadServicesData(
      `report/vendor/invoice?Status_GUID=ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943,DgamvTPATe125f1eb-40b5-4a4c-8a3e-994e3e9e9222&Invoice_Status=0&Planner_GUID=${
        plannerId ? plannerId : ""
      }`,
      this.loadSelectableData
    );
    this.fetchServiceType();
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
      const principal = this.filterFormGroup.get("PRINCIPAL_GUID").value;
      if (principal && "" !== principal) {
        this.filtered_planner.next(
          this.PlannerList.filter(
            (_planner) =>
              _planner["PRINCIPAL_GUID"] === principal &&
              _planner["VESSEL_GUID"] === vessel
          )
        );
      } else {
        this.filtered_planner.next(
          this.PlannerList.filter(
            (_planner) => _planner["VESSEL_GUID"] === vessel
          )
        );
      }
    });
    this.filterFormGroup
      .get("Service_Type_GUID")
      .valueChanges.subscribe((service_type) => {
        this.filtered_vendor.next(
          this.VendorList.filter(
            (_vendor) => _vendor["SERVICE_GUID"] === service_type
          )
        );
      });
  }
  onClickSubmit(data) {
    this.loadServicesData(
      `report/vendor/invoice?Planner_GUID=${
        data["PLANNER_GUID"] ? data["PLANNER_GUID"] : ""
      }&Principal_Guid=${
        data["PRINCIPAL_GUID"] ? data["PRINCIPAL_GUID"] : ""
      }&Vessel_GUID=${
        data["VESSEL_GUID"] ? data["VESSEL_GUID"] : ""
      }&Status_GUID=${
        data["Status_GUID"] ? data["Status_GUID"].join(",") : ""
      }&Service_Type=${
        data["Service_Type_GUID"] ? data["Service_Type_GUID"] : ""
      }&Vendor_GUID=${
        data["Vendor_GUID"] ? data["Vendor_GUID"] : ""
      }&Invoice_Status=${
        data["Invoice_Status"] ? data["Invoice_Status"] : ""
      }&Services_Category=${
        data["Service_Category_GUID"] ? data["Service_Category_GUID"] : ""
      }&fromDate=${data["DateFrom"] ? data["DateFrom"] : ""}&toDate=${
        data["DateTo"] ? data["DateTo"] : ""
      }`
    );
  }
  fetchServiceType() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      const filteredStatus = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "2quoEXxHT1d4cf033-6d84-4f90-a5ec-d8782d44774d"
      );
      this.ServiceTypeList = sysData.filter((item) =>
        [
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        ].includes(item["PARENT_GUID"])
      );
      this.filtered_service_category.next(
        sysData.filter((item) =>
          [
            "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
            "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
            "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
          ].includes(item["PARAMETER_GUID"])
        )
      );
      this.BoatTypeList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );

      if (this.BoatTypeList) this.filtered_boat_type.next(this.BoatTypeList);

      this.filtered_service_type.next(this.ServiceTypeList);
      this.filtered_status.next(filteredStatus);
      this.filterFormGroup.controls["type_Filter"].valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe((val) => {
          this.onFilterChange(
            val,
            "PARAMETER_NAME",
            this.ServiceTypeList,
            this.filtered_service_type
          );
        });
    }
  }
  filterByVendor(vendorGuid) {
    vendorGuid = vendorGuid === "NA" ? null : vendorGuid;
    this.selectedVendor = vendorGuid;
    let data = [];
    if (this.selectedVessel) {
      data = this.AllData.filter(
        (_item) =>
          _item["Vendor_GUID"] === vendorGuid &&
          _item["VESSEL_GUID"] === this.selectedVessel
      );
    } else {
      data = this.AllData.filter(
        (_item) => _item["Vendor_GUID"] === vendorGuid
      );
    }

    this.dataSource.data = data;
    this.refreshSummeryCount(data);
  }
  filterByVessel(vesselGuid) {
    vesselGuid = vesselGuid === "NA" ? null : vesselGuid;
    this.selectedVessel = vesselGuid;
    let data = [];
    if (this.selectedVendor) {
      data = this.AllData.filter(
        (_item) =>
          _item["Vendor_GUID"] === this.selectedVendor &&
          _item["VESSEL_GUID"] === vesselGuid
      );
    } else {
      data = this.AllData.filter(
        (_item) => _item["VESSEL_GUID"] === vesselGuid
      );
    }

    this.dataSource.data = data;
    this.refreshSummeryCount(data, true);
  }
  refreshSummeryCount(AllData, vendorOnly = false) {
    const vendorData = {};
    const vesselData = {};
    AllData.map((_item) => {
      const vendorId = _item["Vendor_GUID"] ? _item["Vendor_GUID"] : "NA";
      if (!vendorData[vendorId]) {
        vendorData[vendorId] = {
          Vendor_Name: _item["Vendor_Name"] || "Vendor not set",
          Vendor_GUID: _item["Vendor_GUID"] || "NA",
          data: [_item],
        };
      } else {
        vendorData[vendorId].data.push(_item);
      }

      if (!vendorOnly) {
        const vesselId = _item["VESSEL_GUID"] ? _item["VESSEL_GUID"] : "NA";
        if (!vesselData[vesselId]) {
          vesselData[vesselId] = {
            VESSEL_NAME: _item["VESSEL_NAME"] || "Vessel not set",
            VESSEL_GUID: _item["VESSEL_GUID"] || "NA",
            data: [_item],
          };
        } else {
          vesselData[vesselId].data.push(_item);
        }
      }
    });

    this.VendorWiseCount = Object.entries(vendorData)
      .map((_item) => _item[1])
      .sort((a: any, b: any) =>
        a["Vendor_Name"].localeCompare(b["Vendor_Name"])
      );
    if (!vendorOnly) {
      this.VesselWiseCount = Object.entries(vesselData)
        .map((_item) => _item[1])
        .sort((a: any, b: any) =>
          a["VESSEL_NAME"].localeCompare(b["VESSEL_NAME"])
        );
    }
  }
  loadServicesData(url: string, callback: Function = null) {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"];
          this.AllData = res["Data"];
          this.AllInvoiceData = res["Data"];
          this.refreshSummeryCount(this.AllData);
          if (callback) {
            callback && callback(this);
          } else if (res["Data"].length > 0) {
            this.applySearchValueFilter(this);
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
  applySearchValueFilter(that) {
    const company = new Set();
    const planner = new Set();
    const vessel = new Set();
    const vendor = new Set();
    that.AllData.map((_item) => {
      if (_item["Planner_GUID"]) planner.add(_item["Planner_GUID"]);
      if (_item["COMPANY_GUID"]) company.add(_item["COMPANY_GUID"]);
      if (_item["VESSEL_GUID"]) vessel.add(_item["VESSEL_GUID"]);
      if (_item["Vendor_GUID"]) vendor.add(_item["Vendor_GUID"]);
    });
    //COMPANY filter
    that.CompanyList = that.AllCompanyList.filter((_item) =>
      company.has(_item["COMPANY_GUID"])
    );
    that.PlannerList = that.AllPlannerList.filter((_item) =>
      planner.has(_item["GUID"])
    );
    that.VesselList = that.AllVesselList.filter((_item) =>
      vessel.has(_item["VESSEL_GUID"])
    );
    that.VendorList = that.AllVendorList.filter((_item) =>
      vendor.has(_item["Vendor_GUID"])
    );

    that.filtered_principal.next(that.CompanyList);
    that.filtered_vessel.next(that.VesselList);
    that.filtered_planner.next(that.PlannerList);
    const uniqueVendor = new Set();
    const filtered_vendor = that.VendorList.filter((_item) => {
      if (uniqueVendor.has(_item["Vendor_GUID"])) {
        return false;
      } else {
        uniqueVendor.add(_item["Vendor_GUID"]);
        return true;
      }
    });
    that.VendorList = filtered_vendor;
    that.filtered_vendor.next(filtered_vendor);
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  exportAsExcel() {
    const exportData = this.AllData.map((_item, index) => ({
      no: index + 1,
      // planner_name: _item["Planner_Ref"],
      // company_name: _item["COMPANY_NAME"],
      vessel_name: _item["VESSEL_NAME"],
      // service_category_name: _item["Service_Category_Name"],
      // service_type_name: _item["Service_Type_Name"],
      service_date: _item["Service_date"]
        ? moment(_item["Service_date"]).format("DD MMM YYYY HH:mm")
        : "",
      // svc_quantity: _item["Svc_Quantity"],
      // vendor_name: _item["Vendor_Name"],
      // currency_name: _item["Currency_Name"],
      // svc_amount: _item["Svc_Amount"],
      remarks: _item["Remarks"],
      // status_name: _item["Status_Name"],
      // fda_invoice: _item["FDA_Vendor_Invoice"],
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [["No", "Vessel Name", "Service Date", "Remarks"]],
      { origin: "A1" }
    );

    ws["!cols"] = this.fitToColumn([
      [{ width: 20 }, { width: 50 }, { width: 150 }, { width: 150 }],
    ]);

    /* save to file */
    XLSX.writeFile(wb, `Vendor_Invoie_Report_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }

  loadSelectableData(that) {
    const payload = {
      module: ["vessels", "planner", "company", "service_vendors"],
    };
    that.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          //COMPANY filter
          that.AllCompanyList = res["Data"].company;
          that.AllPlannerList = res["Data"].planner;
          that.AllVesselList = res["Data"].vessels;
          that.AllVendorList = res["Data"].service_vendors;

          that.applySearchValueFilter(that);

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
          that.filterFormGroup.controls["vendor_Filter"].valueChanges
            .pipe(takeUntil(that._onDestroy))
            .subscribe((val) => {
              that.onFilterChange(
                val,
                "Vendor_Name",
                that.VendorList,
                that.filtered_vendor
              );
            });
          //Vessel filter

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

  clearFilter() {
    this.filterFormGroup.reset();
    this.selectedVendor = null;
    this.selectedVessel = null;
    this.filterFormGroup
      .get("Status_GUID")
      .patchValue([
        "ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943",
        "DgamvTPATe125f1eb-40b5-4a4c-8a3e-994e3e9e9222",
      ]);
    this.filterFormGroup.get("Invoice_Status").patchValue(0);
    this.loadServicesData(
      "report/vendor/invoice?Status_GUID=ZObiwrUD5167ea22d-4415-45c0-8d7f-4ea18cc35943,DgamvTPATe125f1eb-40b5-4a4c-8a3e-994e3e9e9222&Invoice_Status=0"
    );
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
  public sortData(sort: Sort) {
    const data = this.dataSource["data"].slice();
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
  ngOnDestroy() {}
}
