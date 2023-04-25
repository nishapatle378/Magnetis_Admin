import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { AgentScreenComponent } from "../../planner/agent-screen/agent-screen.component";
import { SidenavService } from "../../../layout/sidenav/sidenav.service";
import * as moment from "moment";
import { Title } from "@angular/platform-browser";
import { ReplaySubject, Subject } from "rxjs";
import { StatusChangeConfirmation } from "src/app/common-component/status-change-confirmation/status-change-confirmation.component";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-planner-view",
  templateUrl: "./planner-view.component.html",
  styleUrls: ["./planner-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PlannerViewComponent implements OnInit {
  isFinalInvoice = true;
  pendingFollowUp = 0;
  serviceVendorSummery = [];
  servicesToExport = [];
  BoatWoDetails = [];
  systemParams = [];
  crewServices = [];
  plannerData: any = null;
  serviceCategory = [];
  grandTotalOriginal = [];
  grandTotal = [];
  activeService = null;
  activeServiceObject = null;
  editServiceFlag = null;
  selectedServiceList = [];
  VendorList = [];
  ServiceTypeList = [];
  BoatTypes = [];
  serviceFormIndex = 1;
  fdaSummeryForm: FormGroup;
  isDisabled = false;
  activeChildService = "";
  activeChildServiceValue = null;
  currencyList = [];
  dataSource: MatTableDataSource<any> | null;
  public filtered_crew_category: Array<object> = [];
  ServicesList = [];
  ServiceVendors = {};
  enableSaveService = false;
  host = window.location.protocol + "//" + window.location.host;
  public filtered_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_service_types: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_from: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_to: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_boat_vendor: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_boat_types: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  protected _onDestroy = new Subject<void>();

  @Input()
  columns: ListColumn[] = [
    { property: "Service_Type", visible: true, name: "Service Type" },
    { property: "Svc_Amount", visible: true, name: "Service Amount" },
    { property: "Invoice_Amount", visible: true, name: "Invoice Amount" },
    { property: "Vendor_Name", visible: true, name: "Vendor" },
    { property: "Remarks", visible: true, name: "Remark" },
    { property: "Invoice_Number", visible: true, name: "Invoice Number" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private route: ActivatedRoute,
    private titleService: Title,
    private sidenavService: SidenavService,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`FDA Planner View`);
  }
  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    this.getPlanner();

    this.fdaSummeryForm = this.fb.group({
      Invoice_Number: ["1231", Validators.required],
      Deductable: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Exchange_Rate: [1.4],
      Type: [""],
      Invoice_Date: [""],
      Deductable_Amount: [],
      Remarks: [""],
      Print_Options: ["1"],
      //CTM Billables
      Amount_Due_SGD: [],
      Billable: [],
      Handling_Fee: [],
      Amount_Due: [],
      Amount_Recieved: [],
      Remittance_Received: [],
      USD_Amount_Due: [],
      Applicable_Exchange: [],
      CTM_GUID: [],

      FDA_Amount: [0],
      // FDA_Remarks: [""],
      // FDA_Currency: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Service_Remarks: [""],
      Vendor_Invoice_Number: [""],
      //Boat Fields
      Boat_Type_GUID: [],
      Boat_Vendor_GUID: [],
      Boat_Date: [],
      Boat_From_GUID: [],
      Boat_To_GUID: [],
      Trip_Type: [],
      Boat_Alongside: [],
      Boat_Cast_Off: [],
      Boat_Currency: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Boat_RATE: [],
      Boat_Remarks: [],
      BoatLog_GUID: [],
      Services_Rel_GUID: [],
      Crew_Total_Amount: [0],
    });
    this.sidenavService.setCollapsed(true);
    this.serviceCategory = [
      {
        Service_Guid: "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8",
        Service_Name: "Port Charges",
        isCategory: true,
        currencyName: "SGD",
        Amount: [],
        exclude: [],
      },
      {
        Service_Guid: "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
        Service_Name: "Agency Fee",
        isCategory: true,
        exclude: ["9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"],
        currencyName: "SGD",
        Amount: [],
      },
      {
        Service_Guid: "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10",
        Service_Name: "Handling Fee",
        isCategory: false,
        currencyName: "SGD",
        Amount: [],
        exclude: [],
        category: "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574",
      },
      {
        Service_Guid: "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
        Service_Name: "Owners",
        isCategory: true,
        exclude: [
          "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99",
          "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4",
          "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
        ],
        currencyName: "SGD",
        Amount: [],
      },
      {
        Service_Guid: "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4",
        Service_Name: "Boats",
        isCategory: false,
        currencyName: "SGD",
        Amount: [],
        exclude: [],
        category: "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
      },
      {
        Service_Guid: "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
        Service_Name: "Transport",
        isCategory: false,
        currencyName: "SGD",
        Amount: [],
        exclude: [],
        category: "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
      },
      {
        Service_Guid: "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99",
        Service_Name: "CTM",
        isCategory: false,
        currencyName: "SGD",
        Amount: [],
        exclude: [],
        category: "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8",
      },
    ];
    this.fetchServiceType();
    // this.fdaSummeryForm
    //   .get("Deductable")
    //   .valueChanges.subscribe((Deductable) => {
    //     this.calculateGrandTotal();
    //   });
    this.fdaSummeryForm
      .get("Exchange_Rate")
      .valueChanges.subscribe((Exchange_Rate) => {
        this.calculateGrandTotal();
      });
    this.fdaSummeryForm
      .get("Boat_Type_GUID")
      .valueChanges.subscribe((boat_type) => {
        if ("o9vJdOkeb86a696fe-3376-4557-aac8-fb36192e76fa" === boat_type) {
          this.isDisabled = true;
        } else {
          this.isDisabled = false;
        }
        let filteredVendor = this.VendorList.filter(
          (vendorItem, i, a) =>
            vendorItem["Boat_Types"] &&
            vendorItem["Boat_Types"].includes(boat_type) &&
            a.findIndex(
              (t) => t["Vendor_GUID"] === vendorItem["Vendor_GUID"]
            ) == i
        );
        this.filtered_boat_vendor.next(filteredVendor);
      });
  }
  displayVendor(vendor, serviceType, boatType) {
    if (vendor.SERVICE_GUID === serviceType) {
      if (serviceType === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4") {
        return vendor.SERVICE_GUID &&
          vendor.Boat_Types &&
          vendor.Boat_Types.includes(boatType)
          ? "display:block"
          : "display:none";
      } else {
        return vendor.SERVICE_GUID === serviceType
          ? "display:block"
          : "display:none";
      }
    } else {
      return "display:none";
    }
  }
  calculateGrandTotal = () => {
    const exchage = this.fdaSummeryForm.get("Exchange_Rate").value;
    this.grandTotal = this.grandTotalOriginal.map((_item) => {
      const i = { ..._item };
      if (
        "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a" !==
        _item["Currency_GUID"]
      ) {
        i["Amount"] = exchage * i["Amount"];
      }
      return i;
    });
  };
  isRecordsWithZeroAmount() {
    let guids = this.selectedServiceList
      .filter((i) => i["Svc_Amount"] <= 0)
      .map((_s) => _s["Services_GUID"]);
    return guids.length > 0 ? true : false;
  }
  removeTransportLog() {
    const dialog_ref = this.dialog.open(StatusChangeConfirmation, {
      disableClose: false,
    });
    dialog_ref.componentInstance.message =
      "Are you sure wnt to delete all the records with amount 0";
    dialog_ref.componentInstance.title = "Delete All";
    dialog_ref.afterClosed().subscribe((result) => {
      if (result) {
        let guids = this.selectedServiceList
          .filter((i) => i["Svc_Amount"] <= 0)
          .map((_s) => _s["Services_GUID"]);
        const payload = {
          guids: guids,
        };
        console.log(payload);
        this.api
          .PostDataService(`planner/service/delete-all`, payload)
          .subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                this.getAllServices(this.plannerData["GUID"], false);
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
  changeAddress() {
    let dialogRef = this.dialog.open(AddressSelectionDialog, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });
    dialogRef.componentInstance.COMPANY_GUID =
      this.plannerData["PRINCIPAL_GUID"];
    dialogRef.componentInstance.SELECTED_ADDRESS =
      this.plannerData["Company_Billing_Address"];
    dialogRef.componentInstance.PLANNER_GUID = this.plannerData["GUID"];
    dialogRef.componentInstance.ADDRESS_LIST = this.plannerData[
      "ADDRESS_LIST_JSON"
    ]
      ? JSON.parse(this.plannerData["ADDRESS_LIST_JSON"])
      : [];
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.plannerData["Company_Billing_Address"] = res.selected;
      this.plannerData["ADDRESS_LIST_JSON"] = res.list;
    });
  }
  handlePrintOption() {
    this.resetServiceForm();
    for (let i in this.BoatWoDetails) {
      let _item = this.BoatWoDetails[i];
      this.addNewService(_item);
    }
    this.serviceFilter = "all";
  }
  savePrintOption(Print_Options) {
    this.api
      .PostDataService(`fda/print/save`, {
        plannerId: this.plannerData["GUID"],
        Print_Options: Print_Options,
      })
      .subscribe(
        (res: object) => {
          if (res["Status"] === 200) {
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
  selectAddress() {
    if (
      this.plannerData["Company_Billing_Address"] &&
      this.plannerData["Company_Billing_Address"] != ""
    ) {
      this.saveFinalInvoice();
    } else {
      let dialogRef = this.dialog.open(AddressSelectionDialog, {
        width: "50%",
        maxHeight: "100%",
        disableClose: true,
      });
      dialogRef.componentInstance.COMPANY_GUID =
        this.plannerData["PRINCIPAL_GUID"];
      dialogRef.componentInstance.SELECTED_ADDRESS =
        this.plannerData["Company_Billing_Address"];
      dialogRef.componentInstance.PLANNER_GUID = this.plannerData["GUID"];
      dialogRef.componentInstance.ADDRESS_LIST = this.plannerData[
        "ADDRESS_LIST_JSON"
      ]
        ? JSON.parse(this.plannerData["ADDRESS_LIST_JSON"])
        : [];
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.plannerData["Company_Billing_Address"] = res.selected;
        this.plannerData["ADDRESS_LIST_JSON"] = res.list;
        this.saveFinalInvoice();
      });
    }
  }
  saveFinalInvoice() {
    const formData = this.fdaSummeryForm.value;
    const plannerData = new Object(this.plannerData);
    delete plannerData["FdaPlanDetail"];
    console.log(plannerData);
    const payload = {
      Invoice_Number: formData["Invoice_Number"],
      FDA_Invoice_Date: formData["Invoice_Date"]
        ? moment(formData["Invoice_Date"], "DD MMM YYYY").toISOString()
        : "",
      FDA_Currency: formData["Deductable"],
      Deductable_Amount: formData["Deductable_Amount"],
      Company_Billing_Address: this.plannerData["Company_Billing_Address"],
      FDA_Type: formData["Type"],
      FDA_Amount: 0,
      FDA_Exchange: formData["Exchange_Rate"],
      FDA_Remarks: formData["Remarks"],
      plannerId: this.plannerData["GUID"],
      FdaPlannerData: JSON.stringify(plannerData),
    };
    this.api.PostDataService("fda/finalize", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.isFinalInvoice = true;
          this.common.ShowMessage(
            "FDA details updated successfully",
            "notify-success",
            6000
          );
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
    const exportData = this.servicesToExport.map((_item, index) => ({
      no: index + 1,
      service_category_name: _item["Service_Category_Name"],
      service_type_name: _item["Service_Type_Name"],
      service_date: _item["Service_date"]
        ? moment(_item["Service_date"]).format("DD MMM YYYY HH:mm")
        : "",
      vendor_name: _item["Vendor_Name"],
      svc_quantity: _item["Svc_Quantity"],
      currency_name: _item["Currency_Name"],
      vendor_invoice: _item["FDA_Vendor_Invoice"],
      svc_amount: _item["Svc_Amount"],
      remarks: _item["Remarks"],
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          "No",
          "Service Category",
          "Service Type",
          "Service Date",
          "Vendor Name",
          "Service Quantity",
          "Currency",
          "Invoice Number",
          "Amount",
          "Remarks",
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
    /* save to file */
    XLSX.writeFile(wb, `Fda_Services_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }
  serviceFilter = "all";
  filterListByVendor(vendorName) {
    this.resetServiceForm();
    this.servicesToExport = [];
    for (let i in this.ServicesList) {
      let _item = this.ServicesList[i];
      if (
        this.activeServiceObject.isCategory &&
        this.activeServiceObject.Service_Guid === _item["Services_Category"] &&
        !this.activeServiceObject.exclude.includes(_item["Service_Type"]) &&
        _item["Vendor_Name"] === vendorName
      ) {
        this.servicesToExport.push(_item);
        this.addNewService(_item);
      } else if (
        this.activeServiceObject.Service_Guid === _item["Service_Type"] &&
        _item["Vendor_Name"] === vendorName
      ) {
        this.servicesToExport.push(_item);
        this.addNewService(_item);
      }
    }
  }
  applyServicesFilter(filter = "all") {
    this.resetServiceForm();
    this.servicesToExport = [];
    let printOption = this.fdaSummeryForm.get("Print_Options").value;

    if (printOption == 0) {
      switch (filter) {
        case "with-invoice":
          for (let i in this.BoatWoDetails) {
            let _item = this.BoatWoDetails[i];
            if (
              _item["FDA_Vendor_Invoice"] &&
              _item["FDA_Vendor_Invoice"] != ""
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            }
          }
          this.serviceFilter = "with-invoice";
          break;
        case "without-invoice":
          for (let i in this.BoatWoDetails) {
            let _item = this.BoatWoDetails[i];
            if (
              !_item["FDA_Vendor_Invoice"] ||
              _item["FDA_Vendor_Invoice"] == ""
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            }
          }
          this.serviceFilter = "without-invoice";
          break;
        default:
          for (let i in this.BoatWoDetails) {
            let _item = this.BoatWoDetails[i];
            this.addNewService(_item);
          }
          this.serviceFilter = "all";
      }
    } else {
      switch (filter) {
        case "with-invoice":
          for (let i in this.ServicesList) {
            let _item = this.ServicesList[i];
            if (
              this.activeServiceObject.isCategory &&
              this.activeServiceObject.Service_Guid ===
                _item["Services_Category"] &&
              !this.activeServiceObject.exclude.includes(
                _item["Service_Type"]
              ) &&
              _item["FDA_Vendor_Invoice"] &&
              _item["FDA_Vendor_Invoice"] != ""
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            } else if (
              this.activeServiceObject.Service_Guid === _item["Service_Type"] &&
              _item["FDA_Vendor_Invoice"] &&
              _item["FDA_Vendor_Invoice"] != ""
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            }
          }
          this.serviceFilter = "with-invoice";
          break;
        case "without-invoice":
          for (let i in this.ServicesList) {
            let _item = this.ServicesList[i];
            if (
              this.activeServiceObject.isCategory &&
              this.activeServiceObject.Service_Guid ===
                _item["Services_Category"] &&
              !this.activeServiceObject.exclude.includes(
                _item["Service_Type"]
              ) &&
              (!_item["FDA_Vendor_Invoice"] ||
                _item["FDA_Vendor_Invoice"] == "")
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            } else if (
              this.activeServiceObject.Service_Guid === _item["Service_Type"] &&
              (!_item["FDA_Vendor_Invoice"] ||
                _item["FDA_Vendor_Invoice"] == "")
            ) {
              this.servicesToExport.push(_item);
              this.addNewService(_item);
            }
          }
          this.serviceFilter = "without-invoice";
          break;
        default:
          for (let i in this.ServicesList) {
            let _item = this.ServicesList[i];
            if (
              this.activeServiceObject.isCategory &&
              this.activeServiceObject.Service_Guid ===
                _item["Services_Category"] &&
              !this.activeServiceObject.exclude.includes(_item["Service_Type"])
            ) {
              this.addNewService(_item);
            } else if (
              this.activeServiceObject.Service_Guid === _item["Service_Type"]
            ) {
              this.addNewService(_item);
            }
          }
          this.serviceFilter = "all";
      }
    }
  }
  getAllServices(GUID: string, loadSelectable = true) {
    let fullUrl = "planner/invoice-service/get-by-plan/" + GUID;
    this.api.GetDataService(fullUrl).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          const sysParamData = JSON.parse(
            localStorage.getItem("systemParamsData")
          );
          //Boat without details
          this.BoatWoDetails = res["Data"].boatWoDetails.map((_item) => {
            _item["Vendor_GUID"] = _item["Boat_Vendor_GUID"];
            _item["Svc_Currency_GUID"] = _item["Currency_GUID"];
            _item["Boat_Currency"] = _item["Currency_GUID"];
            _item["Services_Category"] =
              "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8";
            _item["Svc_Amount"] = _item["Boat_RATE"];
            _item["Service_Type"] =
              "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4";
            return _item;
          });
          //Sort Services by sort order
          this.ServicesList = res["Data"].planServices
            .map((_service, index) => {
              let finding = sysParamData.find(
                (s) => s["PARAMETER_GUID"] === _service["Service_Type"]
              );
              if (finding) {
                _service["SORT_ORDER"] = finding["SORT_ORDER"];
              } else {
                _service["SORT_ORDER"] = index;
              }
              return _service;
            })
            .sort((a, b) => {
              if (a["Service_Type"] === b["Service_Type"]) {
                return a["Service_date"] < b["Service_date"] ? -1 : 1;
              } else {
                return a["SORT_ORDER"] < b["SORT_ORDER"] ? -1 : 1;
              }
            });

          this.calculateInvoiceTotal(this.ServicesList, this.BoatWoDetails);
          if (loadSelectable) {
            this.loadSelectableData();
          } else {
            this.loadCrewSummery();
            if (this.activeServiceObject) {
              this.editServiceFlag = null;
              this.resetServiceForm();
              const services =
                this.activeService ===
                  "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4" &&
                this.fdaSummeryForm.get("Print_Options").value == 0
                  ? this.BoatWoDetails
                  : this.ServicesList;
              if (
                this.activeService ===
                  "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4" &&
                this.fdaSummeryForm.get("Print_Options").value == 0
              ) {
                for (let i in services) {
                  let _item = services[i];
                  this.addNewService(_item);
                }
              } else {
                for (let i in services) {
                  let _item = services[i];
                  if (
                    this.activeServiceObject.isCategory &&
                    this.activeServiceObject.Service_Guid ===
                      _item["Services_Category"] &&
                    !this.activeServiceObject.exclude.includes(
                      _item["Service_Type"]
                    )
                  ) {
                    this.addNewService(_item);
                  } else if (
                    this.activeServiceObject.Service_Guid ===
                    _item["Service_Type"]
                  ) {
                    this.addNewService(_item);
                  }
                }
              }

              if (this.activeServiceObject.isCategory) {
                this.filtered_service_types.next(
                  this.ServiceTypeList.filter(
                    (_item) =>
                      _item["PARENT_GUID"] ===
                        this.activeServiceObject.Service_Guid &&
                      !this.activeServiceObject.exclude.includes(
                        _item["PARAMETER_GUID"]
                      )
                  )
                );
              } else {
                this.filtered_service_types.next(
                  this.ServiceTypeList.filter(
                    (_item) =>
                      _item["PARAMETER_GUID"] ===
                      this.activeServiceObject.Service_Guid
                  )
                );
              }
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
  calculateInvoiceTotal(ServicesList, BoatWoDetails) {
    const grandTotal = [];
    this.serviceCategory = this.serviceCategory.map((_parent) => {
      const currency = [];
      if (
        _parent.Service_Guid ===
          "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4" &&
        this.fdaSummeryForm.get("Print_Options").value == 0
      ) {
        BoatWoDetails.map((_item) => {
          const currencyId =
            _item["Currency_GUID"] ||
            "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a";
          let index = currency.findIndex(
            (curr) => curr["Currency_GUID"] === currencyId
          );
          if (index >= 0) {
            currency[index]["Amount"] =
              currency[index]["Amount"] + _item["Svc_Amount"];
          } else {
            currency.push({
              Currency_GUID: currencyId,
              Currency_Name: _item["SHORT_CODE"],
              Amount: _item["Svc_Amount"],
            });
          }
          let gindex = grandTotal.findIndex(
            (curr) => curr["Currency_GUID"] === currencyId
          );

          try {
            if (gindex >= 0) {
              grandTotal[gindex]["Amount"] =
                grandTotal[gindex]["Amount"] + _item["Svc_Amount"];
            } else {
              grandTotal.push({
                Currency_GUID: currencyId,
                Currency_Name: _item["SHORT_CODE"],
                Amount: _item["Svc_Amount"],
              });
            }
          } catch (error) {
            console.error(grandTotal, gindex, currencyId, error);
          }
        });
      } else {
        ServicesList.map((_item) => {
          const currencyId =
            _item["Svc_Currency_GUID"] ||
            "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a";
          if (
            _parent.isCategory &&
            _parent.Service_Guid === _item["Services_Category"] &&
            !_parent.exclude.includes(_item["Service_Type"])
          ) {
            let index = currency.findIndex(
              (curr) => curr["Currency_GUID"] === currencyId
            );

            if (index >= 0) {
              currency[index]["Amount"] =
                currency[index]["Amount"] + _item["Svc_Amount"];
            } else {
              currency.push({
                Currency_GUID: currencyId,
                Currency_Name: _item["SHORT_CODE"],
                Amount: _item["Svc_Amount"],
              });
            }
            let gindex = grandTotal.findIndex(
              (curr) => curr["Currency_GUID"] === currencyId
            );

            if (gindex >= 0) {
              grandTotal[gindex]["Amount"] =
                grandTotal[gindex]["Amount"] + _item["Svc_Amount"];
            } else {
              grandTotal.push({
                Currency_GUID: currencyId,
                Currency_Name: _item["SHORT_CODE"],
                Amount: _item["Svc_Amount"],
              });
            }
          } else if (_parent.Service_Guid === _item["Service_Type"]) {
            let index = currency.findIndex(
              (curr) => curr["Currency_GUID"] === currencyId
            );
            if (index >= 0) {
              currency[index]["Amount"] =
                currency[index]["Amount"] + _item["Svc_Amount"];
            } else {
              currency.push({
                Currency_GUID: currencyId,
                Currency_Name: _item["SHORT_CODE"],
                Amount: _item["Svc_Amount"],
              });
            }
            let gindex = grandTotal.findIndex(
              (curr) => curr["Currency_GUID"] === currencyId
            );

            try {
              if (gindex >= 0) {
                grandTotal[gindex]["Amount"] =
                  grandTotal[gindex]["Amount"] + _item["Svc_Amount"];
              } else {
                grandTotal.push({
                  Currency_GUID: currencyId,
                  Currency_Name: _item["SHORT_CODE"],
                  Amount: _item["Svc_Amount"],
                });
              }
            } catch (error) {
              console.error(grandTotal, gindex, currencyId, error);
            }
          }
        });
      }

      _parent.Amount = currency;
      this.grandTotalOriginal = [...grandTotal];
      this.grandTotal = grandTotal;

      return _parent;
    });
    console.log(this.serviceCategory);
  }
  itemExistInArray(array, key, value) {
    let result = array.filter((_item) => _item[key] === value);
    if (result.length > 0) {
      return true;
    }
    return false;
  }
  finalizeInvoice() {
    const formData = this.fdaSummeryForm.value;

    if (
      !formData["Invoice_Number"] ||
      formData["Invoice_Number"] === "" ||
      !formData["Invoice_Date"] ||
      formData["Invoice_Date"] === ""
    ) {
      Swal.fire({
        icon: "error",
        title: "Alert",
        text: "Invoice number and Invoice date is required",
        backdrop: false,
      });
      return;
    }

    Swal.fire({
      template: "#my-template",
      title: "Alert",
      text: "Are you sure you want to finalize invoice? you will not be able to modify details again.",
      icon: "warning",
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: "Close",
      confirmButtonText: "Ok",
      backdrop: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectAddress();
      }
    });
  }
  loadCharges(PRINCIPAL_GUID, Services_GUID = "") {
    const payload = {
      module: ["company_charges", "crew_charges"],
      PRINCIPAL_GUID: PRINCIPAL_GUID,
      Services_GUID: Services_GUID,
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      if (res["Status"] === 200) {
        const sysData = JSON.parse(localStorage.getItem("systemParamsData"));
        this.filtered_crew_category = sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "Hr5H0YaIH50f0572b-82d6-4e7a-ad24-f9062ae234b2"
        );
        const company_charges = res["Data"].company_charges;
        const crew_charges = res["Data"].crew_charges;

        this.filtered_crew_category = this.filtered_crew_category.map(
          (item, index) => {
            const charge = company_charges.find(
              (_item) => _item["CREW_TYPE_GUID"] === item["PARAMETER_GUID"]
            );
            const quantity = crew_charges.find(
              (_item) => _item["Service_Item_Guid"] === item["PARAMETER_GUID"]
            );
            item["index"] = index;
            item["CREW_TYPE_GUID"] = item["PARAMETER_GUID"];
            item["Charge"] = charge ? charge["Charge"] : 0;
            item["Planned_Quantity"] = quantity
              ? quantity["Planned_Quantity"]
              : 0;
            item["Actual_Quantity"] = quantity
              ? quantity["Actual_Quantity"]
              : 0;
            item["Charge"] = quantity ? quantity["Rate"] : item["Charge"];
            return item;
          }
        );
        this.getDimonitationScale();
      }
    });
  }
  isPrintable(_service) {
    const total = _service.Amount.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue.Amount;
    }, 0);

    return total <= 0;
  }
  onServiceClick(service, click = true) {
    if (click && service.Service_Guid === this.activeService) {
      return;
    }
    this.activeService = service.Service_Guid;
    this.activeServiceObject = service;
    const Print_Options = this.fdaSummeryForm.get("Print_Options").value;
    // if (this.fdaSummeryForm.get("Print_Options").value == 0) {
    //   console.log("Print_Options is 0");
    //   this.fdaSummeryForm.get("Print_Options").patchValue(1);
    //   return;
    // }

    this.editServiceFlag = null;
    this.resetServiceForm();
    this.servicesToExport = [];
    if (
      Print_Options == 0 &&
      service.Service_Guid === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
    ) {
      this.BoatWoDetails.sort((a, b) => {
        if (a.Boat_Type_GUID === b.Boat_Type_GUID) {
          return a.Service_date < b.Service_date ? -1 : 1;
        } else {
          return a.Boat_Type_GUID < b.Boat_Type_GUID ? -1 : 1;
        }
      });
      for (let i in this.BoatWoDetails) {
        let _item = this.BoatWoDetails[i];
        this.addNewService(_item);
      }
    } else {
      if (
        service.Service_Guid === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
      ) {
        this.ServicesList.sort((a, b) => {
          if (a.Boat_Type_GUID === b.Boat_Type_GUID) {
            return a.Service_date < b.Service_date ? -1 : 1;
          } else {
            return a.Boat_Type_Order < b.Boat_Type_Order ? -1 : 1;
          }
        });
      }

      for (let i in this.ServicesList) {
        let _item = this.ServicesList[i];
        if (
          this.activeServiceObject.isCategory &&
          this.activeServiceObject.Service_Guid ===
            _item["Services_Category"] &&
          !this.activeServiceObject.exclude.includes(_item["Service_Type"])
        ) {
          this.servicesToExport.push(_item);
          this.addNewService(_item);
        } else if (
          this.activeServiceObject.Service_Guid === _item["Service_Type"]
        ) {
          this.servicesToExport.push(_item);
          this.addNewService(_item);
        }
      }
    }

    this.serviceVendorSummery = Object.entries(
      this.servicesToExport.reduce(function (acc, curr) {
        if (curr["Vendor_Name"]) {
          if (acc[curr["Vendor_Name"]]) {
            acc[curr["Vendor_Name"]] = ++acc[curr["Vendor_Name"]];
          } else {
            acc[curr["Vendor_Name"]] = 1;
          }
        }
        return acc;
      }, {})
    ).sort((a, b) => a[0].localeCompare(b[0]));

    if (this.activeServiceObject.isCategory) {
      this.filtered_service_types.next(
        this.ServiceTypeList.filter(
          (_item) =>
            _item["PARENT_GUID"] === this.activeServiceObject.Service_Guid &&
            !this.activeServiceObject.exclude.includes(_item["PARAMETER_GUID"])
        )
      );
    } else {
      this.filtered_service_types.next(
        this.ServiceTypeList.filter(
          (_item) =>
            _item["PARAMETER_GUID"] === this.activeServiceObject.Service_Guid
        )
      );
    }
  }

  ngAfterViewInit() {
    this.sidenavService.setCollapsed(true);
  }
  ngOnDestroy() {
    this.sidenavService.setCollapsed(false);
  }

  DeleteService(item) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          if (item["Services_GUID"]) {
            var post = {
              Services_GUID: item["Services_GUID"],
              MODIFIED_BY: "ADMIN",
            };
            this.api.PostDataService(`planner/service/delete`, post).subscribe(
              (res: object) => {
                if (res["Status"] === 200) {
                  this.getAllServices(this.plannerData["GUID"], false);
                  this.removeFromServiceForm(item.index);
                  this.common.ShowMessage(
                    res["Message"],
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
          } else {
            this.removeFromServiceForm(item.index);
          }
        }
      });
  }
  loadCrewSummery() {
    this.api
      .GetDataService(`fda/crew/summery/${this.plannerData["GUID"]}`)
      .subscribe(
        (res: object) => {
          if (res["Status"] === 200) {
            this.crewServices = res["Data"];
          } else {
            this.common.ShowMessage(
              "Error in loading crew summery",
              "notify-error",
              6000
            );
          }
        },
        (error) => {
          this.common.ShowMessage(error["Message"], "notify-error", 6000);
        }
      );
  }
  removeFromServiceForm(i) {
    this.fdaSummeryForm.removeControl(`Service_Type_${i}`);
    this.fdaSummeryForm.removeControl(`Service_date_${i}`);
    this.fdaSummeryForm.removeControl(`Vendor_GUID_${i}`);
    this.fdaSummeryForm.removeControl(`Svc_Quantity_${i}`);
    this.fdaSummeryForm.removeControl(`Svc_Currency_GUID_${i}`);
    this.fdaSummeryForm.removeControl(`Invoice_Number_${i}`);
    this.fdaSummeryForm.removeControl(`Svc_Amount_${i}`);
    this.fdaSummeryForm.removeControl(`Service_Type_${i}`);
    this.selectedServiceList = this.selectedServiceList.filter(
      (_item) => _item["index"] != i
    );
  }
  EditSingleService(item) {
    console.log("dddd", this.activeChildService, item.index);
    if (this.activeChildService === item.index) {
      return;
    }
    if (!item["Service_Type"] || item["Service_Type"] === "") {
      this.editServiceFlag = null;
      return;
    }
    this.activeChildService = item.index;
    this.activeChildServiceValue = item;
    this.fdaSummeryForm
      .get("Services_Rel_GUID")
      .patchValue(item["Services_GUID"]);
    if (
      item["Service_Type"] === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
    ) {
      if (!item["BoatLog_GUID"] || item["BoatLog_GUID"] == "") {
        return;
      }
      this.editServiceFlag = "boat";
      this.fdaSummeryForm
        .get("Boat_Type_GUID")
        .patchValue(item["Boat_Type_GUID"]);
      this.fdaSummeryForm
        .get("Boat_Vendor_GUID")
        .patchValue(item["Boat_Vendor_GUID"]);
      this.fdaSummeryForm
        .get("Boat_Date")
        .patchValue(
          item["Boat_Date"]
            ? moment(item["Boat_Date"]).format("DD MMM YYYY HH:mm")
            : ""
        );
      this.fdaSummeryForm
        .get("Boat_From_GUID")
        .patchValue(item["Boat_From_GUID"]);
      this.fdaSummeryForm.get("Boat_To_GUID").patchValue(item["Boat_To_GUID"]);
      this.fdaSummeryForm.get("Trip_Type").patchValue(item["Trip_Type"]);

      this.fdaSummeryForm
        .get("Boat_Alongside")
        .patchValue(
          item["Boat_Alongside"]
            ? moment(item["Boat_Alongside"]).format("HH:mm")
            : ""
        );
      this.fdaSummeryForm
        .get("Boat_Cast_Off")
        .patchValue(
          item["Boat_Cast_Off"]
            ? moment(item["Boat_Cast_Off"]).format("HH:mm")
            : ""
        );
      this.fdaSummeryForm
        .get("Boat_Currency")
        .patchValue(item["Boat_Currency"]);
      this.fdaSummeryForm.get("Boat_RATE").patchValue(item["Boat_RATE"]);
      this.fdaSummeryForm.get("Boat_Remarks").patchValue(item["Boat_Remarks"]);
      this.fdaSummeryForm.get("BoatLog_GUID").patchValue(item["BoatLog_GUID"]);
    } else if (
      item["Service_Type"] === "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
    ) {
      this.editServiceFlag = "ctm";
      let billable = item["Billable"] ? item["Billable"] : 0;
      let handling_fee = item["Handling_Fee"] ? item["Handling_Fee"] : 0;
      this.fdaSummeryForm.get("Billable").patchValue(item["Billable"]);
      this.fdaSummeryForm.get("Handling_Fee").patchValue(item["Handling_Fee"]);
      this.fdaSummeryForm
        .get("Amount_Due")
        .patchValue((billable / 100) * handling_fee + billable);
      this.fdaSummeryForm
        .get("Amount_Recieved")
        .patchValue(item["Amount_Recieved"]);
      this.fdaSummeryForm
        .get("Remittance_Received")
        .patchValue(item["Remittance_Received"]);
      this.fdaSummeryForm
        .get("USD_Amount_Due")
        .patchValue(item["USD_Amount_Due"]);
      this.fdaSummeryForm
        .get("Applicable_Exchange")
        .patchValue(item["Applicable_Exchange"]);
      this.fdaSummeryForm
        .get("Amount_Due_SGD")
        .patchValue(item["Applicable_Exchange"] * item["USD_Amount_Due"]);
      const that = this;
      //Register form value changes
      this.fdaSummeryForm
        .get("Billable")
        .valueChanges.subscribe((Total_Amount) => {
          that.updateAmountCalculation(that);
        });
      this.fdaSummeryForm
        .get("Handling_Fee")
        .valueChanges.subscribe(function (handlingFee) {
          that.updateAmountCalculation(that);
        });
      this.fdaSummeryForm
        .get("Applicable_Exchange")
        .valueChanges.subscribe(function (handlingFee) {
          that.updateAmountCalculation(that);
        });
      this.fdaSummeryForm
        .get("Amount_Recieved")
        .valueChanges.subscribe(function (recievedAmt) {
          that.updateAmountCalculation(that);
        });
    } else if (
      item["Service_Type"] === "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
    ) {
      this.editServiceFlag = "crew";
      this.loadCharges(
        this.plannerData["PRINCIPAL_GUID"],
        item["Services_GUID"]
      );
    } else {
      this.editServiceFlag = "service";
    }
    this.fdaSummeryForm
      .get("FDA_Amount")
      .patchValue(item["FDA_Amount"] || item["Svc_Amount"]);
    // this.fdaSummeryForm
    //   .get("FDA_Remarks")
    //   .patchValue(item["FDA_Remarks"] || "");
    // this.fdaSummeryForm
    //   .get("FDA_Currency")
    //   .patchValue(
    //     item["FDA_Currency"] || "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
    //   );
    this.fdaSummeryForm
      .get("Vendor_Invoice_Number")
      .patchValue(item["FDA_Vendor_Invoice"] || "");
    this.fdaSummeryForm
      .get("Service_Remarks")
      .patchValue(item["Remarks"] || "");
  }
  resetServiceForm() {
    for (let i in this.selectedServiceList) {
      this.fdaSummeryForm.removeControl(`Service_Type_${i}`);
      this.fdaSummeryForm.removeControl(`Service_date_${i}`);
      this.fdaSummeryForm.removeControl(`Vendor_GUID_${i}`);
      this.fdaSummeryForm.removeControl(`Svc_Quantity_${i}`);
      this.fdaSummeryForm.removeControl(`Svc_Currency_GUID_${i}`);
      this.fdaSummeryForm.removeControl(`Invoice_Number_${i}`);
      this.fdaSummeryForm.removeControl(`Svc_Amount_${i}`);
      this.fdaSummeryForm.removeControl(`Service_Type_${i}`);
    }
    this.selectedServiceList = [];
    this.enableSaveService = false;
  }
  updateAmountCalculation(thisVar) {
    try {
      const Total_Amount = thisVar.fdaSummeryForm.get("Billable").value
        ? parseFloat(thisVar.fdaSummeryForm.get("Billable").value)
        : 0;
      const handlingFee = thisVar.fdaSummeryForm.get("Handling_Fee").value
        ? parseFloat(thisVar.fdaSummeryForm.get("Handling_Fee").value)
        : 0;
      const exRate = thisVar.fdaSummeryForm.get("Applicable_Exchange").value
        ? parseFloat(thisVar.fdaSummeryForm.get("Applicable_Exchange").value)
        : 1.4;
      const recievedAmt = thisVar.fdaSummeryForm.get("Amount_Recieved").value
        ? parseFloat(thisVar.fdaSummeryForm.get("Amount_Recieved").value)
        : 0;

      let handlingFeeTotal = ((handlingFee * Total_Amount) / 100).toFixed(2);
      let Total_Amount_Due = parseFloat(handlingFeeTotal) + Total_Amount;
      thisVar.fdaSummeryForm.get("Amount_Due").patchValue(Total_Amount_Due);

      thisVar.fdaSummeryForm
        .get("USD_Amount_Due")
        .patchValue((Total_Amount_Due - recievedAmt).toFixed(2));
      const Amount_Due = Total_Amount_Due - recievedAmt;
      thisVar.fdaSummeryForm
        .get("Amount_Due_SGD")
        .patchValue(exRate * Amount_Due);
    } catch (error) {
      console.log("Error in setting amount ", error);
    }
  }
  addNewService(data = null) {
    const index = this.serviceFormIndex + 1;
    this.serviceFormIndex = index;
    if (
      this.activeService === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
    ) {
      this.fdaSummeryForm.addControl(
        "Service_Type_" + index,
        this.fb.control("fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4")
      );
    } else {
      this.fdaSummeryForm.addControl(
        "Service_Type_" + index,
        this.fb.control(data?.Service_Type || null)
      );
    }

    this.fdaSummeryForm.addControl(
      "Service_date_" + index,
      this.fb.control(
        data?.Service_date
          ? moment(data?.Service_date).format("DD MMM YYYY HH:mm")
          : moment().format("DD MMM YYYY HH:mm")
      )
    );
    this.fdaSummeryForm.addControl(
      "Vendor_GUID_" + index,
      this.fb.control(data?.Vendor_GUID || null)
    );
    this.fdaSummeryForm.addControl(
      "Remarks_" + index,
      this.fb.control(data?.Remarks || null)
    );
    this.fdaSummeryForm.addControl(
      "Svc_Quantity_" + index,
      this.fb.control(data?.Svc_Quantity || 1)
    );
    this.fdaSummeryForm.addControl(
      "Status_GUID_" + index,
      this.fb.control(data?.Status_GUID)
    );
    if (
      this.activeService === "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
    ) {
      this.fdaSummeryForm.addControl(
        "Boat_Type_GUID_" + index,
        this.fb.control(data?.Boat_Type_GUID)
      );
      this.fdaSummeryForm.addControl(
        "BoatLog_GUID_" + index,
        this.fb.control(data?.BoatLog_GUID)
      );
      this.fdaSummeryForm.addControl(
        "Svc_Currency_GUID_" + index,
        this.fb.control(
          data?.Currency_GUID || "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
        )
      );
    } else {
      this.fdaSummeryForm.addControl(
        "Svc_Currency_GUID_" + index,
        this.fb.control(
          data?.Svc_Currency_GUID ||
            "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
        )
      );
    }

    this.fdaSummeryForm.addControl(
      "Invoice_Number_" + index,
      this.fb.control(data?.FDA_Vendor_Invoice || "")
    );
    this.fdaSummeryForm.addControl(
      "Svc_Amount_" + index,
      this.fb.control(data?.Svc_Amount || 0)
    );
    if (data && data.Service_Type) {
      this.ServiceVendors["vendors_" + index] = this.VendorList.filter(
        (item) => item["SERVICE_GUID"] === data.Service_Type
      );
    }
    this.fdaSummeryForm
      .get("Service_Type_" + index)
      .valueChanges.subscribe((Service_Type) => {
        let service = this.ServiceTypeList.find(
          (item) => item["PARAMETER_GUID"] === Service_Type
        );
        if (service) {
          if (
            Service_Type === "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
          ) {
            this.fdaSummeryForm
              .get("Svc_Currency_GUID_" + index)
              .setValue("IQpoC9bW88a501628-f9d8-4e2e-9363-91d2ded8d283");
          } else {
            this.fdaSummeryForm
              .get("Svc_Currency_GUID_" + index)
              .setValue("SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a");
          }

          this.ServiceVendors["vendors_" + index] = this.VendorList.filter(
            (item) => item["SERVICE_GUID"] === Service_Type
          );
        }
      });

    this.selectedServiceList.push({
      index: index,
      ...data,
    });
    if (!data) {
      this.enableSaveService = true;
    }
  }
  saveBulkService() {
    let errors = false;
    try {
      const services = [];
      const serviceCategory = this.serviceCategory.find(
        (_item) => _item.Service_Guid === this.activeService
      );
      this.selectedServiceList.map((_item) => {
        const service = {};
        service["Services_GUID"] = _item["Services_GUID"] || null;
        service["Services_Category"] = serviceCategory.isCategory
          ? serviceCategory.Service_Guid
          : serviceCategory.category;
        const data = this.fdaSummeryForm.get(
          "Service_date_" + _item.index
        ).value;
        service["Service_date"] = data
          ? moment(data, "DD MMM YYYY HH:mm").toISOString()
          : null;
        service["Planner_GUID"] = this.plannerData["GUID"];
        service["Service_Type"] = this.fdaSummeryForm.get(
          "Service_Type_" + _item.index
        ).value;
        service["Status_GUID"] = this.fdaSummeryForm.get(
          "Status_GUID_" + _item.index
        ).value;
        service["Svc_Quantity"] = this.fdaSummeryForm.get(
          "Svc_Quantity_" + _item.index
        ).value;
        service["Vendor_GUID"] = this.fdaSummeryForm.get(
          "Vendor_GUID_" + _item.index
        ).value;
        service["Svc_Currency_GUID"] = this.fdaSummeryForm.get(
          "Svc_Currency_GUID_" + _item.index
        ).value;
        service["Svc_Amount"] = this.fdaSummeryForm.get(
          "Svc_Amount_" + _item.index
        ).value;
        service["Invoice_Number"] = this.fdaSummeryForm.get(
          "Invoice_Number_" + _item.index
        ).value;
        service["Vessel_Guid"] = this.plannerData["VESSEL_GUID"];
        service["Remarks"] = this.fdaSummeryForm.get(
          "Remarks_" + _item.index
        ).value;
        services.push(service);
        if (
          service["Service_Type"] ===
          "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
        ) {
          service["Boat_Types"] = this.fdaSummeryForm.get(
            "Boat_Type_GUID_" + _item.index
          ).value;
          service["BoatLog_GUID"] = this.fdaSummeryForm.get(
            "BoatLog_GUID_" + _item.index
          ).value;
        }
        if (
          service["Vendor_GUID"] == null ||
          service["Vendor_GUID"] == "" ||
          service["Service_Type"] == null ||
          service["Service_Type"] == ""
        ) {
          errors = true;
        }

        return _item;
      });
      if (errors) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill the required field (Service Type, Vendor)",
          backdrop: false,
        });
        return;
      }

      this.api
        .PostDataService("fda/services/save", {
          services,
          boat_with_details:
            this.activeServiceObject.Service_Guid ===
              "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4" &&
            this.fdaSummeryForm.get("Print_Options").value == 0
              ? true
              : false,
        })
        .subscribe(
          (res) => {
            if (res["Status"] === 200) {
              this.resetServiceForm();
              this.getAllServices(this.plannerData["GUID"], false);
              this.common.ShowMessage(
                "Services saved successfully",
                "notify-success",
                6000
              );
            } else {
              this.common.ShowMessage(res["message"], "notify-error", 6000);
            }
          },
          (error) => {
            this.common.ShowMessage(error["message"], "notify-error", 6000);
          }
        );
    } catch (error) {
      console.log(error);
    }
  }

  saveFdaService(formData) {
    const payload = {};
    if (this.editServiceFlag === "crew") {
      payload["crew_services"] = [];
      let total = 0;
      this.filtered_crew_category.map((note) => {
        let obj = {
          Service_Item_Guid: formData["Category_" + note["index"]],
          Planned_Quantity: formData["Planned_Quantity_" + note["index"]],
          Actual_Quantity: formData["Actual_Quantity_" + note["index"]],
          Rate: formData["Charge_" + note["index"]],
          Total_Amount: formData["Total_" + note["index"]],
        };
        total = total + parseFloat(formData["Total_" + note["index"]] || 0);
        payload["crew_services"].push(obj);
      });
      payload["Total_Amount"] = this.plannerData["GUID"];
      payload["Svc_Amount"] = formData["Crew_Total_Amount"];
    } else if (this.editServiceFlag === "ctm") {
      payload["Billable"] = formData["Billable"];
      payload["Handling_Fee"] = formData["Handling_Fee"];
      payload["Amount_Due"] = formData["Amount_Due"];
      payload["Amount_Recieved"] = formData["Amount_Recieved"];
      payload["Remittance_Received"] = formData["Remittance_Received"];
      payload["Amount_Due_SGD"] = formData["Amount_Due_SGD"];
      payload["Applicable_Exchange"] = formData["Applicable_Exchange"];
      payload["USD_Amount_Due"] = formData["USD_Amount_Due"];
      payload["Svc_Amount"] = formData["Amount_Due_SGD"];
    } else if (this.editServiceFlag === "boat") {
      payload["Boat_Type_GUID"] = formData["Boat_Type_GUID"];
      payload["BoatLog_GUID"] = formData["BoatLog_GUID"];
      payload["Boat_Vendor_GUID"] = formData["Boat_Vendor_GUID"];
      payload["Boat_Date"] = formData["Boat_Date"]
        ? moment(formData["Boat_Date"], "DD MMM YYYY HH:mm").toISOString()
        : "";
      payload["Boat_From_GUID"] = formData["Boat_From_GUID"];
      payload["Boat_To_GUID"] = formData["Boat_To_GUID"];
      payload["Trip_Type"] = formData["Trip_Type"];

      if (
        formData["Boat_Alongside"] &&
        formData["Boat_Alongside"].includes(":")
      ) {
        payload["Boat_Alongside"] = moment(
          `${moment(moment(formData["Boat_Date"], "DD MMM YYYY HH:mm")).format(
            "YYYY-MM-DD"
          )}T${formData["Boat_Alongside"]}:00.00Z`
        );
      } else if (
        formData["Boat_Alongside"] &&
        4 === formData["Boat_Alongside"].length
      ) {
        payload["Boat_Alongside"] = moment(
          `${moment(moment(formData["Boat_Date"], "DD MMM YYYY HH:mm")).format(
            "YYYY-MM-DD"
          )}T${this.insertColon(formData["Boat_Alongside"], 2, ":")}:00.00Z`
        );
      }

      if (
        formData["Boat_Cast_Off"] &&
        formData["Boat_Cast_Off"].includes(":")
      ) {
        payload["Boat_Cast_Off"] = moment(
          `${moment(moment(formData["Boat_Date"], "DD MMM YYYY HH:mm")).format(
            "YYYY-MM-DD"
          )}T${formData["Boat_Cast_Off"]}:00.00Z`
        );
      } else if (
        formData["Boat_Cast_Off"] &&
        4 === formData["Boat_Cast_Off"].length
      ) {
        payload["Boat_Cast_Off"] = moment(
          `${moment(moment(formData["Boat_Date"], "DD MMM YYYY HH:mm")).format(
            "YYYY-MM-DD"
          )}T${this.insertColon(formData["Boat_Cast_Off"], 2, ":")}:00.00Z`
        );
      }
      payload["Boat_Currency"] = formData["Boat_Currency"];
      payload["Boat_RATE"] = formData["Boat_RATE"];
      payload["Svc_Amount"] = formData["Boat_RATE"];
    } else {
      payload["Svc_Amount"] = formData["FDA_Amount"];
    }

    payload["Services_GUID"] = this.activeChildServiceValue["Services_GUID"];
    payload["Service_Type"] = this.activeChildServiceValue["Service_Type"];
    payload["Planner_Guid"] = this.plannerData["GUID"];
    payload["Vessel_Guid"] = this.plannerData["VESSEL_GUID"];

    payload["FDA_Vendor_Invoice"] = formData["Vendor_Invoice_Number"];
    payload["FDA_Currency"] = formData["FDA_Currency"];
    payload["FDA_Amount"] = formData["FDA_Amount"];
    payload["Remarks"] = formData["Service_Remarks"];

    this.api.PostDataService("fda/service/save", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.resetServiceForm();
          this.getAllServices(this.plannerData["GUID"], false);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  insertColon(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }
  deleteFDAService() {
    this.DeleteService(this.activeChildServiceValue);
  }
  saveFdaDetails(formData: object) {
    // if (
    //   !formData["Invoice_Number"] ||
    //   formData["Invoice_Number"] === "" ||
    //   !formData["Invoice_Date"] ||
    //   formData["Invoice_Date"] === ""
    // ) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Alert",
    //     text: "Invoice number and Invoice date is required",
    //     backdrop: false,
    //   });
    //   return;
    // }
    const payload = {
      Invoice_Number: formData["Invoice_Number"],
      FDA_Invoice_Date: formData["Invoice_Date"]
        ? moment(formData["Invoice_Date"], "DD MMM YYYY").toISOString()
        : "",
      FDA_Currency: formData["Deductable"],
      Company_Billing_Address: this.plannerData["Company_Billing_Address"],
      Deductable_Amount: formData["Deductable_Amount"],
      FDA_Type: formData["Type"],
      FDA_Amount: 0,
      FDA_Exchange: formData["Exchange_Rate"],
      FDA_Remarks: formData["Remarks"],
      plannerId: this.plannerData["GUID"],
      // Invoice_Status_Guid: 'UzQzLVk8G88296ce7-5d4a-4b74-a510-6d95f76b79df',
    };
    this.api.PostDataService("fda/save", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "FDA details updated successfully",
            "notify-success",
            6000
          );
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
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
  formatTime(event) {
    var str = event.target.value;
    str = str.replace(/:/g, "");
    if (str.length === 4) {
      let minut = str.slice(-2);
      let hour = str.slice(0, -2);
      if (minut > 59) {
        minut = `00`;
      }
      if (hour > 23) {
        hour = `00`;
      }
      event.target.value = `${hour}:${minut}`;
    }
    if (str.length === 5) {
      event.target.value = `${str[0]}${str[1]}:${str[2]}${str[3]}`;
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
  loadSelectableData() {
    const payload = {
      module: ["currency", "service_vendors"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.currencyList = res["Data"].currency;
          this.filtered_currency.next(this.currencyList);
          this.VendorList = res["Data"].service_vendors;
          this.filtered_vendor.next(this.VendorList);
          this.loadCrewSummery();
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
      this.systemParams = sysData;
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
      const type = sysData.filter(
        (_item) =>
          _item["PARENT_GUID"] ===
          "VXTTRsOKwa600a2e0-c71d-49db-86ab-339be3f26c81"
      );
      const boattypes = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "NkrjGmd1E29b5e778-2f14-40bb-94b5-a760081dde3e"
      );
      this.filtered_boat_types.next(boattypes);
      this.filtered_type.next(type);
      this.filtered_service_types.next(this.ServiceTypeList);
      this.filtered_status.next(filteredStatus);

      //Set Boats data

      this.filtered_from.next(
        sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "dSKWQyM3mee96a280-f43b-446c-89bf-049f13139ae8"
        )
      );
      this.filtered_to.next(
        sysData.filter(
          (item) =>
            item["PARENT_GUID"] ==
            "dSKWQyM3mee96a280-f43b-446c-89bf-049f13139ae8"
        )
      );
    }
  }
  validateDate(event, name):any {
    const value = event.target.value.substring(0, 17);
    if (value.length === 2) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 6) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 11) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 14 && !value.includes(":")) {
      event.target.value = `${value}:`;
      return true;
    }

    event.target.value = value;
  }
  validateDateOnly(event, name):any {
    const value = event.target.value.substring(0, 11);
    if (value.length === 2) {
      event.target.value = `${value} `;
      return true;
    }
    if (value.length === 6) {
      event.target.value = `${value} `;
      return true;
    }
    event.target.value = value;
  }
  printTemplate: string = `<div class="container">
  <div class="row">
      <div class="col-12">
          <div class="card">
              <div class="card-body p-0">
                  <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
                    <tr>
                      <td style="width:50%"> <img height="100" width="300"  src="${this.host}/assets/img/Client_Logo.png"></td>
                      <td style="width:50%"> <p><strong>Westech Building, 237 Pandan Loop, #08-04,
                      </br>Singapore 128424, www.seawave.com.sg
                      </br>Tel: +65 68723915 | Fax: +65 68723914</strong>
                      </p>
                      </td>
                    </tr>
                  </table>
                 <hr style="width:100%"/>
                  {{header}}
                  <div class="row pb-5 p-5">
                  <div class="col-md-12">
                      <table class="table table-borderless">
                          {{main_table}}
                      </table>
                  </div>
                  {{footer}}
              </div>
              </div>
          </div>
      </div>
  </div>
</div>`;

  getPlanner() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) {
      let fullUrl = `planner/by-ref?ref_number=${id}&followup=1`;
      this.api.GetDataService(fullUrl).subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.plannerData = res["Data"];
            this.pendingFollowUp = res["Data"]["followup"] || 0;
            this.fdaSummeryForm
              .get("Print_Options")
              .patchValue(this.plannerData["Print_Options"]);

            this.fdaSummeryForm
              .get("Print_Options")
              .valueChanges.subscribe((Print_Options) => {
                this.savePrintOption(Print_Options);
                this.calculateInvoiceTotal(
                  this.ServicesList,
                  this.BoatWoDetails
                );
                if (Print_Options == 0) {
                  this.handlePrintOption();
                } else {
                  this.onServiceClick(this.activeServiceObject, false);
                }
              });

            if (
              this.plannerData["Invoice_Status_Guid"] ==
              "5HdIlQ6Wo94d2d926-b8a6-4ed6-b909-67ae334f8ed9"
            ) {
              this.isFinalInvoice = true;
            } else {
              this.isFinalInvoice = false;
            }

            if (this.plannerData && this.plannerData["GUID"]) {
              if (this.plannerData["FDA_Currency"]) {
                this.fdaSummeryForm
                  .get("Deductable")
                  .patchValue(this.plannerData["FDA_Currency"]);
              }
              this.fdaSummeryForm
                .get("Deductable_Amount")
                .patchValue(this.plannerData["Deductable_Amount"]);
              this.fdaSummeryForm
                .get("Exchange_Rate")
                .patchValue(this.plannerData["FDA_Exchange"]);
              if (this.plannerData["FDA_Invoice_Date"]) {
                this.fdaSummeryForm
                  .get("Invoice_Date")
                  .patchValue(
                    moment(this.plannerData["FDA_Invoice_Date"]).format(
                      "DD MMM YYYY"
                    )
                  );
              }

              this.fdaSummeryForm
                .get("Remarks")
                .patchValue(this.plannerData["FDA_Remarks"]);
              this.fdaSummeryForm
                .get("Invoice_Number")
                .patchValue(this.plannerData["Invoice_Number"]);
              this.fdaSummeryForm
                .get("Type")
                .patchValue(this.plannerData["FDA_Type"]);
              if (
                this.plannerData["FdaPlanDetail"] &&
                this.plannerData["Invoice_Status_Guid"] ===
                  "5HdIlQ6Wo94d2d926-b8a6-4ed6-b909-67ae334f8ed9"
              ) {
                try {
                  this.plannerData = JSON.parse(
                    this.plannerData["FdaPlanDetail"]
                  );
                } catch (error) {
                  console.log(error);
                }
              }
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
  showAddService() {
    const dialogRef = this.dialog.open(AgentScreenComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
      data: this.plannerData,
    });
    dialogRef.componentInstance.invoiceService = true;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.getAllServices(this.plannerData["GUID"]);
      }
    });
  }

  isControlAdded = false;
  // deleteService(data) {}
  getDimonitationScale() {
    const that = this;
    let total = 0;
    if (this.isControlAdded) {
      this.filtered_crew_category.map((item) => {
        const actualQty = item["Actual_Quantity"] || 0;
        this.fdaSummeryForm
          .get("Category_" + item["index"])
          .patchValue(item["CREW_TYPE_GUID"]);
        this.fdaSummeryForm
          .get("Planned_Quantity_" + item["index"])
          .patchValue(item["Planned_Quantity"] || 0);
        this.fdaSummeryForm
          .get("Charge_" + item["index"])
          .patchValue(item["Charge"]);
        this.fdaSummeryForm
          .get("Actual_Quantity_" + item["index"])
          .patchValue(actualQty);
        this.fdaSummeryForm
          .get("Total_" + item["index"])
          .patchValue(actualQty * item["Charge"]);
      });
      that.calculateTotalAmount(that);
    } else {
      this.isControlAdded = true;
      this.filtered_crew_category.map((item) => {
        this.fdaSummeryForm.addControl(
          "Category_" + item["index"],
          this.fb.control(item["CREW_TYPE_GUID"])
        );
        this.fdaSummeryForm.addControl(
          "Charge_" + item["index"],
          this.fb.control(item["Charge"])
        );
        this.fdaSummeryForm.addControl(
          "Planned_Quantity_" + item["index"],
          this.fb.control(item["Planned_Quantity"] || 0)
        );
        const actualQty = item["Actual_Quantity"] || 0;
        this.fdaSummeryForm.addControl(
          "Actual_Quantity_" + item["index"],
          this.fb.control(actualQty)
        );
        total = total + actualQty * item["Charge"];
        this.fdaSummeryForm.addControl(
          "Total_" + item["index"],
          this.fb.control(actualQty * item["Charge"])
        );

        this.fdaSummeryForm
          .get("Actual_Quantity_" + item["index"])
          .valueChanges.subscribe(function (value_100) {
            let billValue =
              that.fdaSummeryForm.get("Charge_" + item["index"]).value || 0;
            const total = parseFloat(value_100) * parseFloat(billValue);

            that.fdaSummeryForm.get("Total_" + item["index"]).patchValue(total);
            that.calculateTotalAmount(that);
          });
        this.fdaSummeryForm
          .get("Charge_" + item["index"])
          .valueChanges.subscribe(function (value_100) {
            let billValue =
              that.fdaSummeryForm.get("Actual_Quantity_" + item["index"])
                .value || 0;
            const total = parseFloat(value_100) * parseFloat(billValue);

            that.fdaSummeryForm.get("Total_" + item["index"]).patchValue(total);
            that.calculateTotalAmount(that);
          });
        this.fdaSummeryForm.get("Crew_Total_Amount").setValue(total);
      });
    }
  }
  calculateTotalAmount(that) {
    let totalAmount = 0;
    that.filtered_crew_category.map((item) => {
      const amount = that.fdaSummeryForm.get("Total_" + item["index"]).value;
      totalAmount = totalAmount + (amount ? amount : 0);
    });
    that.fdaSummeryForm.get("Crew_Total_Amount").patchValue(totalAmount);
  }
  printAllServices() {
    if (
      this.fdaSummeryForm.value.Print_Options === null ||
      this.fdaSummeryForm.value.Print_Options === ""
    ) {
      Swal.fire({
        template: "#my-template",
        title: "Alert",
        text: "Please select print options for boat",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonColor: "#d33",
        cancelButtonText: "Close",
        backdrop: false,
      }).then((result) => {});
      return;
    }

    if (
      this.isFinalInvoice ||
      (this.plannerData["Company_Billing_Address"] !== "" &&
        this.plannerData["Company_Billing_Address"] !== null)
    ) {
      let printFormHtml = this.prepareInvoice();
      let chitNumber = 1;
      let pageBreak = `<p class="pdf-pagebreak-before">Service Chit #${chitNumber}</p>`;
      this.serviceCategory.map((_item, index) => {
        const total = _item.Amount.reduce(function (accumulator, currentValue) {
          return accumulator + currentValue.Amount;
        }, 0);
        if (total > 0) {
          if (
            _item.Service_Guid ===
            "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
          ) {
            if (this.crewServices && this.crewServices.length > 0) {
              let chilHtml = this.prepareServiceChit(
                _item.Service_Name,
                _item.Service_Guid
              );
              printFormHtml = `${printFormHtml}<p class="pdf-pagebreak-before">Service Chit #${chitNumber}</p>${
                index < 6 ? chilHtml : ""
              }`;
              chitNumber = chitNumber + 1;
            } else {
              Swal.fire({
                template: "#my-template",
                title: "Alert",
                text: "0 Crew Services found",
                icon: "warning",
                showCancelButton: true,
                showConfirmButton: false,
                cancelButtonColor: "#d33",
                cancelButtonText: "Close",
                backdrop: false,
              }).then((result) => {});
              return;
            }
          } else {
            let chilHtml = this.prepareServiceChit(
              _item.Service_Name,
              _item.Service_Guid
            );

            printFormHtml = `${printFormHtml}<p class="pdf-pagebreak-before">Service Chit #${chitNumber}</p>${chilHtml}`;
            chitNumber = chitNumber + 1;
          }
        }
      });

      const finalPdf = this.formatEmailHtml(printFormHtml);
      var html = htmlToPdfmake(finalPdf, {
        imagesByReference: true,
        tableAutoSize: true,
      });
      const documentDefinition = {
        content: html.content,
        images: html.images,
        pageBreakBefore: function (currentNode) {
          return (
            currentNode.style &&
            currentNode.style.indexOf("pdf-pagebreak-before") > -1
          );
        },
      };
      pdfMake.createPdf(documentDefinition).open();
    } else {
      let dialogRef = this.dialog.open(AddressSelectionDialog, {
        width: "50%",
        maxHeight: "100%",
        disableClose: true,
      });
      dialogRef.componentInstance.COMPANY_GUID =
        this.plannerData["PRINCIPAL_GUID"];
      dialogRef.componentInstance.SELECTED_ADDRESS =
        this.plannerData["Company_Billing_Address"];
      dialogRef.componentInstance.PLANNER_GUID = this.plannerData["GUID"];
      dialogRef.componentInstance.ADDRESS_LIST = this.plannerData[
        "ADDRESS_LIST_JSON"
      ]
        ? JSON.parse(this.plannerData["ADDRESS_LIST_JSON"])
        : [];
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.plannerData["Company_Billing_Address"] = res.selected;
        this.plannerData["ADDRESS_LIST_JSON"] = res.list;
        let chitNumber = 1;
        let printFormHtml = this.prepareInvoice();
        this.serviceCategory.map((_item, index) => {
          const total = _item.Amount.reduce(function (
            accumulator,
            currentValue
          ) {
            return accumulator + currentValue.Amount;
          },
          0);
          if (total > 0) {
            if (
              _item.Service_Guid ===
              "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
            ) {
              if (this.crewServices && this.crewServices.length > 0) {
                let chilHtml = this.prepareServiceChit(
                  _item.Service_Name,
                  _item.Service_Guid
                );
                printFormHtml = `${printFormHtml}<p class="pdf-pagebreak-before">Service Chit #${chitNumber}</p>${
                  index < 6 ? chilHtml : ""
                }`;
                chitNumber = chitNumber + 1;
              } else {
                Swal.fire({
                  template: "#my-template",
                  title: "Alert",
                  text: "0 Crew Services found",
                  icon: "warning",
                  showCancelButton: true,
                  showConfirmButton: false,
                  cancelButtonColor: "#d33",
                  cancelButtonText: "Close",
                  backdrop: false,
                }).then((result) => {});
                return;
              }
            } else {
              let chilHtml = this.prepareServiceChit(
                _item.Service_Name,
                _item.Service_Guid
              );

              printFormHtml = `${printFormHtml}<p class="pdf-pagebreak-before">Service Chit #${chitNumber}</p>${chilHtml}`;
              chitNumber = chitNumber + 1;
            }
          }
        });

        const finalPdf = this.formatEmailHtml(printFormHtml);
        var html = htmlToPdfmake(finalPdf, {
          imagesByReference: true,
          tableAutoSize: true,
        });
        const documentDefinition = {
          content: html.content,
          images: html.images,
          pageBreakBefore: function (currentNode) {
            return (
              currentNode.style &&
              currentNode.style.indexOf("pdf-pagebreak-before") > -1
            );
          },
        };
        pdfMake.createPdf(documentDefinition).open();
      });
    }
  }
  printService(type = null) {
    console.log(
      this.plannerData["Company_Billing_Address"],
      this.isFinalInvoice
    );
    if (
      this.isFinalInvoice ||
      (this.plannerData["Company_Billing_Address"] !== "" &&
        this.plannerData["Company_Billing_Address"] !== null)
    ) {
      let printFormHtml = "";
      if (type) {
        if (type === "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10") {
          if (this.crewServices && this.crewServices.length > 0) {
            printFormHtml = this.prepareServiceChit(
              type.Service_Name,
              type.Service_Guid
            );
          } else {
            Swal.fire({
              template: "#my-template",
              title: "Alert",
              text: "0 Crew Services found",
              icon: "warning",
              showCancelButton: true,
              showConfirmButton: false,
              cancelButtonColor: "#d33",
              cancelButtonText: "Close",
              backdrop: false,
            }).then((result) => {});
            return;
          }
        } else {
          printFormHtml = this.prepareServiceChit(
            type.Service_Name,
            type.Service_Guid
          );
        }
      } else {
        printFormHtml = this.prepareInvoice();
      }

      const finalPdf = this.formatEmailHtml(printFormHtml);
      var html = htmlToPdfmake(finalPdf, {
        imagesByReference: true,
        tableAutoSize: true,
      });
      const documentDefinition = {
        content: html.content,
        images: html.images,
        pageBreakBefore: function (currentNode) {
          return (
            currentNode.style &&
            currentNode.style.indexOf("pdf-pagebreak-before") > -1
          );
        },
      };
      pdfMake.createPdf(documentDefinition).open();
    } else {
      let dialogRef = this.dialog.open(AddressSelectionDialog, {
        width: "50%",
        maxHeight: "100%",
        disableClose: true,
      });
      dialogRef.componentInstance.COMPANY_GUID =
        this.plannerData["PRINCIPAL_GUID"];
      dialogRef.componentInstance.SELECTED_ADDRESS =
        this.plannerData["Company_Billing_Address"];
      dialogRef.componentInstance.PLANNER_GUID = this.plannerData["GUID"];
      dialogRef.componentInstance.ADDRESS_LIST = this.plannerData[
        "ADDRESS_LIST_JSON"
      ]
        ? JSON.parse(this.plannerData["ADDRESS_LIST_JSON"])
        : [];
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.plannerData["Company_Billing_Address"] = res.selected;
        this.plannerData["ADDRESS_LIST_JSON"] = res.list;

        let printFormHtml = "";
        if (type) {
          if (type === "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10") {
            if (this.crewServices && this.crewServices.length > 0) {
              printFormHtml = this.prepareServiceChit(
                type.Service_Name,
                type.Service_Guid
              );
            } else {
              Swal.fire({
                template: "#my-template",
                title: "Alert",
                text: "0 Crew Services found",
                icon: "warning",
                showCancelButton: true,
                showConfirmButton: false,
                cancelButtonColor: "#d33",
                cancelButtonText: "Close",
                backdrop: false,
              }).then((result) => {});
              return;
            }
          } else {
            printFormHtml = this.prepareServiceChit(
              type.Service_Name,
              type.Service_Guid
            );
          }
        } else {
          printFormHtml = this.prepareInvoice();
        }

        const finalPdf = this.formatEmailHtml(printFormHtml);
        var html = htmlToPdfmake(finalPdf, {
          imagesByReference: true,
          tableAutoSize: true,
        });
        const documentDefinition = {
          content: html.content,
          images: html.images,
          pageBreakBefore: function (currentNode) {
            return (
              currentNode.style &&
              currentNode.style.indexOf("pdf-pagebreak-before") > -1
            );
          },
        };
        pdfMake.createPdf(documentDefinition).open();
      });
    }
  }

  formatEmailHtml(printFormHtml) {
    return printFormHtml;
  }
  prepareServiceChit(title, type) {
    const addresses = (this.plannerData["Company_Billing_Address"] || "")
      .replace(/\n/g, "&&")
      .split("&&");
    if (addresses.length) {
      addresses[0] = `<span style="font-weight:bold">${addresses[0]}</span>`;
    }
    console.log(addresses)
    try {
      const header = `<table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
    <tr style="width:100%">
      <td colspan="2"> <h2>SERVICE CHIT - ${title.toUpperCase()}</h2></td>
    </tr>
    <tr>
    <td style="width:50%;font-size:10pt;"> 
          ${addresses.join("<br />")} 
    </td>
    <td style="width:50%">
      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
      <tr>
      <td style="width:50%;font-size:10pt;">
      Invoice No.<br />
      Name of Vessel<br />
      Appointment Type <br />
      Arrival date <br />
      Departure date <br />
      Magentis reference <br />
      ${this.plannerData["APPOINTMENT_REF"] ? "Principal Appointment<br />" : ""}
      </td>
      <td style="width:50%;font-size:10pt;">
      : ${this.fdaSummeryForm.get("Invoice_Number").value || ""}<br />
      : <span style="font-weight:bold">${this.plannerData["VESSEL_NAME"]}</span><br />
      : ${this.plannerData["APPOINTMENT_TYPE_NAME"]} <br />
      : ${
        this.plannerData["VESSEL_ACTUAL_ARR"]
          ? moment(this.plannerData["VESSEL_ACTUAL_ARR"]).format("DD MMM YYYY")
          : ""
      } <br />
      : ${
        this.plannerData["VESSEL_ACTUAL_DEP"]
          ? moment(this.plannerData["VESSEL_ACTUAL_DEP"]).format("DD MMM YYYY")
          : ""
      } <br />
      : ${this.plannerData["REF_NUM"]} <br />
      ${
        this.plannerData["APPOINTMENT_REF"]
          ? `: ${this.plannerData["APPOINTMENT_REF"]}`
          : ""
      }
      </td>
      </tr>
      </table>
      </td>
    </tr>
  </table>`;
      let amountUsd = 0;
      let exchangeRate = 0;
      let serviceCount = 0;
      [...this.ServicesList].map((_service) => {
        if (
          _service["Service_Type"] ===
          "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
        ) {
          amountUsd = amountUsd + _service["USD_Amount_Due"];
          exchangeRate = exchangeRate + _service["Applicable_Exchange"];
          serviceCount++;
        }
      });
      exchangeRate = serviceCount > 0 ? exchangeRate / serviceCount : 0;
      const footer = ``;
      let table = ``;
      switch (type) {
        //Agent Charges
        case "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574":
          table = ` <thead>
    <tr style="font-size:10pt;font-weight:bold">
        <th style="width:50%">SERVICE TYPE</th>
        <th style="width:25%">REMARKS</th>
        <th style="width:25%;text-align:right">AMOUNT SGD</th>
    </tr>
  </thead>
  <tbody>
  ${[...this.ServicesList]
    .filter((i) => i["Svc_Amount"] > 0)
    .map((_item) =>
      (_item["Service_Type"] == type || _item["Services_Category"] == type) &&
      _item["Service_Type"] != "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10"
        ? `<tr style="font-size:10pt;">
  <td>${_item["Service_Type_Name"]}</td>
  <td>${_item["Remarks"] || ""}</td>
  <td style="text-align:right;">${this.currencyFormate(
    _item["Svc_Amount"]
  )}</td>
 </tr>`
        : ""
    )
    .join("")}
  </tbody>
  <tfoot>
  <tr style="font-size:10pt;font-weight:bold">
    <td style="text-align:right;" colspan="2">TOTAL</td>
    <td style="text-align:right;">${this.currencyFormate(
      [...this.ServicesList].reduce(function (accumulator, _item) {
        return (
          accumulator +
          (_item["Service_Type"] == type ||
          (_item["Services_Category"] == type &&
            _item["Service_Type"] !=
              "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10")
            ? _item["Svc_Amount"]
            : 0)
        );
      }, 0)
    )}</td>
  </tr>
  </tfoot>`;
          break;
        //Crew Charges
        case "9mY6JkMJj72a8a16b-27e2-444d-8776-d930860cfd10":
          let total = 0;
          let cr = this.crewServices
            .map((_cr) => {
              const param = this.systemParams.find(
                (_item) => _item["PARAMETER_GUID"] === _cr["Service_Item_Guid"]
              );
              total = total + _cr["Total_Amount"];
              _cr["ServiceName"] = param ? param["PARAMETER_NAME"] : "";
              _cr["SORT_ORDER"] = param ? param["SORT_ORDER"] : "";
              return _cr;
            })
            .filter((_item) => _item["Actual_Quantity"] > 0)
            .sort((a, b) => a["SORT_ORDER"] - b["SORT_ORDER"]);
          table = `<thead>
        <tr style="font-size:10pt;font-weight:bold">
            <th style="width:40%;text-align:center">CATEGORY</th>
            <th style="width:20%;text-align:center">FINAL QUANTITY</th>
            <th style="width:20%;text-align:right">CHARGED SGD</th>
            <th style="width:20%;text-align:right">TOTAL SGD</th>
        </tr>
      </thead>
      <tbody>
      ${cr
        .map(
          (_item) => ` <tr style="font-size:10pt;">
      <td style="width:40%;text-align:center">${_item["ServiceName"]}</td>
      <td style="width:40%;text-align:center">${
        _item["Actual_Quantity"] > 0 ? _item["Actual_Quantity"] : ""
      }</td>
      <td style="text-align:right">${this.currencyFormate(
        (_item["Rate"] / _item["total_records"]).toFixed(2)
      )}</td>
      <td style="text-align:right">${this.currencyFormate(
        _item["Total_Amount"]
      )}</td>
     </tr>`
        )
        .join("\n")}
      </tbody>
      <tfoot>
      <tr style="font-size:10pt;font-weight:bold">
        <td colspan="3" style="text-align:right">TOTAL SGD</td>
        <td style="text-align:right">${this.currencyFormate(total)}</td>
      </tr>
      </tfoot>`;
          break;
        //port charges
        case "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8":
          table = ` <thead>
    <tr style="font-size:10pt;font-weight:bold">
        <th style="width:20%">SERVICE TYPE</th>
        <th style="width:20%">REMARKS</th>
        <th style="width:20%">VENDOR</th>
        <th style="width:20%">INVOICE NO</th>
        <th style="width:20%;text-align:right">AMOUND SGD</th>
    </tr>
  </thead>
  <tbody>
  ${[...this.ServicesList]
    .filter((i) => i["Svc_Amount"] > 0)
    .map((_item) =>
      _item["Service_Type"] == type || _item["Services_Category"] == type
        ? `<tr style="font-size:10pt;">
  <td>${_item["Service_Type_Name"]}</td>
  <td>${_item["Remarks"] || ""}</td>
  <td>${_item["Vendor_Name"] || ""}</td>
  <td>${_item["FDA_Vendor_Invoice"]}</td>
  <td style="text-align:right;">${this.currencyFormate(
    _item["Svc_Amount"]
  )}</td>
 </tr>`
        : ""
    )
    .join("")}
  </tbody>
  <tfoot>
  <tr style="font-size:10pt;font-weight:bold">
    <td colspan="4">TOTAL SGD</td>
    <td style="text-align:right;">${this.currencyFormate(
      [...this.ServicesList]
        .reduce(function (accumulator, _item) {
          return (
            accumulator +
            (_item["Service_Type"] == type || _item["Services_Category"] == type
              ? _item["Svc_Amount"]
              : 0)
          );
        }, 0)
        .toFixed(2)
    )}</td>
  </tr>
  </tfoot>`;
          break;
        //Owner Charges
        case "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8":
          const services = [...this.ServicesList].filter(
            (_item) =>
              (_item["Service_Type"] == type ||
                _item["Services_Category"] == type) &&
              ![
                "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99",
                "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4",
                "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9",
              ].includes(_item["Service_Type"])
          );
          table = ` <thead>
    <tr style="font-size:10pt;font-weight:bold">
        <th style="width:20%">SERVICE TYPE</th>
        <th style="width:20%">REMARKS</th>
        <th style="width:20%">VENDOR</th>
        <th style="width:20%">INVOICE NO</th>
        <th style="width:20%;text-align:right;" >AMOUNT SGD</th>
    </tr>
  </thead>
  <tbody>
  ${services
    .filter((i) => i["Svc_Amount"] > 0)
    .map((_item) =>
      _item["Service_Type"] == type || _item["Services_Category"] == type
        ? `<tr style="font-size:10pt;font-weight:bold">
  <td>${_item["Service_Type_Name"]}</td>
  <td>${_item["Remarks"] || ""}</td>
  <td>${_item["Vendor_Name"] || ""}</td>
  <td>${_item["FDA_Vendor_Invoice"] || ""}</td>
  <td style="text-align:right;">${this.currencyFormate(
    _item["Svc_Amount"]
  )}</td>
 </tr>`
        : ""
    )
    .join("")}
  </tbody>
  <tfoot>
  <tr style="font-size:10pt;font-weight:bold">
    <td colspan="4" style="text-align:right;">TOTAL SGD</td>
    <td style="text-align:right;">${services
      .reduce(function (accumulator, _item) {
        return (
          accumulator +
          (_item["Service_Type"] == type || _item["Services_Category"] == type
            ? _item["Svc_Amount"]
            : 0)
        );
      }, 0)
      .toFixed(2)}</td>
  </tr>
  </tfoot>`;
          break;
        //Boat Charges
        case "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4":
          const detail = this.fdaSummeryForm.get("Print_Options").value;
          let sequence = 1;
          const botserviceslist =
            detail == 1 ? [...this.ServicesList] : [...this.BoatWoDetails];
          const boatServices = botserviceslist
            .filter((_item) => _item["Service_Type"] === type)
            .filter((i) => i["Boat_RATE"] > 0)
            .map((_boat) => {
              const boatType = this.systemParams.find(
                (params) => params["PARAMETER_GUID"] === _boat["Boat_Type_GUID"]
              );
              return {
                sequence: sequence++,
                date: _boat["Boat_Date"]
                  ? moment(_boat["Boat_Date"]).format("DD MMM YYYY")
                  : "",
                description: _boat["Boat_Remarks"] || _boat["Remarks"] || "",
                vendor: _boat["Vendor_Name"] || "",
                amount: _boat["Svc_Amount"] ? _boat["Svc_Amount"] : 0,
                invoive_no: _boat["FDA_Vendor_Invoice"] || "",
                currency: _boat["SHORT_CODE"] || "",
                Boat_RATE: _boat["Boat_RATE"] || 0,
                boatType: boatType ? boatType["PARAMETER_NAME"] : "",
                SORT_ORDER: boatType ? boatType["SORT_ORDER"] : 0,
              };
            })
            .sort((a, b) => a["SORT_ORDER"] - b["SORT_ORDER"]);

          table = ` <thead>
          <tr style="font-size:10pt;font-weight:bold">
          <th style="width:20%">DATE</th>
          <th style="width:15%">SERVICE TYPE</th>
          <th style="width:15%">VENDOR NAME</th>
          <th style="width:20%">REMARKS</th>
          <th style="width:15%">INVOICE NO</th>
          <th style="width:15%;text-align:right">TOTAL SGD</th>
          </tr>
        </thead>
        <tbody>
        ${boatServices
          .map(
            (_item) =>
              `<tr style="font-size:10pt">
        
        <td>${_item.date}</td>
        <td>${_item.boatType}</td>
        <td>${_item.vendor}</td>
        <td>${_item.description}</td>
        <td>${_item.invoive_no}</td>
        <td style="text-align:right">${this.currencyFormate(
          _item.Boat_RATE
        )}</td>
       </tr>`
          )
          .join("")}<tr style="font-size:10pt;font-weight:bold">
          <td colspan="5" style="text-align:right;">TOTAL SGD</td>
          <td style="text-align:right;">${this.currencyFormate(
            boatServices.reduce(function (accumulator, _item) {
              return accumulator + parseFloat(_item["Boat_RATE"]);
            }, 0)
          )}</td>
        </tr>
        </tbody>`;

          break;
        //CTM Charges
        case "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99":
          table = ` <thead>
    <tr>
    <th style="width:10%;font-size:8pt;text-align:right;">AMOUNT<br/>USD</th>
    <th style="width:15%;font-size:8pt;text-align:center;">HANDLING CHARGES<br/>(%)</th>
    <th style="width:10%;font-size:8pt;text-align:right;">TOTAL DUE<br/>USD</th>
    <th style="width:18%;font-size:8pt;text-align:right;">AMOUNT RECEIVED<br/>USD</th>
    <th style="width:12%;font-size:8pt;text-align:right;">AMOUNT DUE<br/>USD</th>
    <th style="width:20%;font-size:8pt;text-align:right;">EXCHANGE RATE<br/>USD</th>
    <th style="width:15%;font-size:8pt;text-align:right;">AMOUNT DUE<br/>SGD</th>
    </tr>
  </thead>
  <tbody>
  ${[...this.ServicesList]
    .filter((i) => i["Svc_Amount"] > 0)
    .map((_item) =>
      _item["Service_Type"] == type || _item["Services_Category"] == type
        ? `<tr>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    _item["Billable"] || 0
  )}</td>
  <td style="text-align:center;font-size:8pt;">${
    _item["Handling_Fee"] || 0
  }</td>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    (_item["Billable"] || 0) +
      ((_item["Billable"] || 0) / 100) * (_item["Handling_Fee"] || 0)
  )}</td>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    _item["Amount_Recieved"] || 0
  )}</td>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    _item["USD_Amount_Due"] || 0
  )}</td>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    _item["Applicable_Exchange"] || 0
  )}</td>
  <td style="text-align:right;font-size:8pt;">${this.currencyFormate(
    (_item["USD_Amount_Due"] || 0) * (_item["Applicable_Exchange"] || 0)
  )}</td>
 </tr>`
        : ""
    )
    .join("")}
  </tbody>`;
          break;
        //Transport Charges
        case "3BgIl9pcdc29059dd-6a5c-47f8-8906-0d45671699f9":
          table = ` <thead>
    <tr>
        <th style="width:20%;">SERVICE TYPE</th>
        <th style="width:20%">REMARKS</th>
        <th style="width:20%">VENDOR</th>
        <th style="width:20%">VENDOR INVOICE NO</th>
        <th style="width:20%;text-align:right">AMOUND SGD</th>
    </tr>
  </thead>
  <tbody>
  ${[...this.ServicesList]
    .filter((i) => i["Svc_Amount"] > 0)
    .map((_item) =>
      _item["Service_Type"] == type || _item["Services_Category"] == type
        ? `<tr>
  <td>${_item["Service_Type_Name"]}</td>
  <td>${_item["Remarks"] || ""}</td>
  <td>${_item["Vendor_Name"] || ""}</td>
  <td>${_item["Svc_Amount"]}</td>
  <td style="text-align:right;">${this.currencyFormate(
    _item["Svc_Amount"] || 0
  )}</td>
 </tr>`
        : ""
    )
    .join("")}
  </tbody>
  <tfoot>
  <tr>
    <td colspan="4">TOTAL SGD</td>
    <td style="text-align:right;">${[...this.ServicesList]
      .reduce(function (accumulator, _item) {
        return (
          accumulator +
          (_item["Service_Type"] == type || _item["Services_Category"] == type
            ? _item["Svc_Amount"]
            : 0)
        );
      }, 0)
      .toFixed(2)}</td>
  </tr>
  </tfoot>`;
          break;
      }
      let printFormHtml = `${this.printTemplate}`;
      printFormHtml = printFormHtml.replace(/{{header}}/g, header);
      printFormHtml = printFormHtml.replace(/{{main_table}}/g, table);
      printFormHtml = printFormHtml.replace(/{{footer}}/g, footer);
      return printFormHtml;
    } catch (error) {
      console.log("Error in format", error);
      return "";
    }
  }
  serviceList = [];
  prepareInvoice() {
    this.serviceList = [];
    const fdaCurrency = this.fdaSummeryForm.get("Deductable").value;
    const header = ` <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
    <tr>
      <td style="width:50%"> <h1>TAX INVOICE</h1></td>
      <td style="width:50%"> 
      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
      <tr>
      <td style="width:50%;font-size:10pt;"><strong>Date <br />
      Invoice No
      </strong></td>
      <td style="width:50%;font-size:10pt;"><strong> :  ${
        this.fdaSummeryForm.get("Invoice_Date").value
          ? moment(this.fdaSummeryForm.get("Invoice_Date").value).format(
              "DD MMM YYYY"
            )
          : ""
      }<br /> : ${
      this.fdaSummeryForm.get("Invoice_Number").value || "#"
    }</strong></td>
    </tr>
      </table>
      </td>
    </tr>
   
    <tr>
      <td style="width:50%;font-size:10pt;"><p style="font-size:10pt;margin:0">${(
        this.plannerData["Company_Billing_Address"] || ""
      ).replace(/\n/g, "<br />")}</p>
      </td>
      <td>
      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
      <tr>
      <td style="width:50%;font-size:10pt;">
      Name of Vessel<br />
      Purpose <br />
      Arrival date <br />
      Departure time <br />
      Terms <br />
      Magentis reference <br />
      ReferenceNumber <br />
      </td>
      <td style="width:50%;font-size:10pt;">
     
      : ${this.plannerData["VESSEL_NAME"].toUpperCase()}<br />
      : ${this.plannerData["APPOINTMENT_TYPE_NAME"]} <br />
      : ${
        this.plannerData["VESSEL_ACTUAL_ARR"]
          ? moment(this.plannerData["VESSEL_ACTUAL_ARR"]).format("DD MMM YYYY")
          : ""
      } <br />
      : ${
        this.plannerData["VESSEL_ACTUAL_DEP"]
          ? moment(this.plannerData["VESSEL_ACTUAL_DEP"]).format("DD MMM YYYY")
          : ""
      } <br />
      : 30 days <br />
      : ${this.plannerData["REF_NUM"]} <br />
      : ${this.plannerData["APPOINTMENT_REF"]} 
      </td>
      </tr>
      </table>
      </td>
    </tr>
  </table>`;

    let portCharges = `<tr>
  <td><p style="font-size:10pt"><strong>PORT CHARGES</strong></p></td>
  <td></td>
 </tr>`;
    let agentCharges = `<tr>
  <td><p style="font-size:10pt"><strong>AGENT CHARGES</strong></p></td>
  <td></td>
 </tr>`;
    let ownerCharges = `<tr>
  <td><p style="font-size:10pt"><strong>OWNERS CHARGES</strong></p></td>
  <td></td>
 </tr>`;
    let total = 0;
    let portChargesCount = 1;
    let agentChargesCount = 1;
    let owerChargesCount = 1;
    let services = [...this.ServicesList];
    if (this.fdaSummeryForm.get("Print_Options").value == 0) {
      services = services.filter(
        (i) =>
          i["Service_Type"] !== "fDuweTWYJdd925e31-0ae0-4e7c-800c-9e6aef7f4bb4"
      );
      services = [...services, ...this.BoatWoDetails];
    }
    services.map((_item) => {
      const service = this.serviceList.find(
        (_service) => _item["Service_Type"] === _service["Service_Type"]
      );

      if (service) {
        this.serviceList.map((_service, index) => {
          if (
            _item["Service_Type"] === this.serviceList[index]["Service_Type"]
          ) {
            this.serviceList[index]["Svc_Amount"] =
              _item["Svc_Amount"] + this.serviceList[index]["Svc_Amount"];
          }
        });
      } else {
        this.serviceList.push({ ..._item });
      }
      return _item;
    });
    let portServiceArr = [];
    console.log("this.serviceList", this.serviceList);
    const sysParamData = JSON.parse(localStorage.getItem("systemParamsData"));
    this.serviceList = this.serviceList
      .filter((i) => i["Svc_Amount"] > 0)
      .map((_service, index) => {
        let finding = sysParamData.find(
          (s) => s["PARAMETER_GUID"] === _service["Service_Type"]
        );
        if (finding) {
          _service["SORT_ORDER"] = finding["SORT_ORDER"];
        } else {
          _service["SORT_ORDER"] = index;
        }
        return _service;
      })
      .sort((a, b) => {
        if (a["Service_Type"] === b["Service_Type"]) {
          return a["Service_date"] < b["Service_date"] ? -1 : 1;
        } else {
          return a["SORT_ORDER"] < b["SORT_ORDER"] ? -1 : 1;
        }
      });
    this.serviceList.map((_item) => {
      total = total + _item["Svc_Amount"];
      const serviceType = this.systemParams.find(
        (_service) => _item["Service_Type"] === _service["PARAMETER_GUID"]
      );
      if (serviceType) {
        if (
          "XRsgGzHL42ce89b8f-0417-40ae-9866-b42f4a744de8" ===
          _item["Services_Category"]
        ) {
          const findIndex = portServiceArr.findIndex(
            (i) =>
              (i["SeviceName"].includes("Pilot") &&
                serviceType["PARAMETER_NAME"].includes("Pilot")) ||
              (i["SeviceName"].includes("Tugs") &&
                serviceType["PARAMETER_NAME"].includes("Tugs"))
          );

          if (findIndex != -1) {
            portServiceArr[findIndex]["Amount"] =
              portServiceArr[findIndex]["Amount"] + _item["Svc_Amount"];
          } else {
            const serviceName = serviceType["PARAMETER_NAME"].includes("Pilot")
              ? "Pilotage"
              : serviceType["PARAMETER_NAME"].includes("Tugs")
              ? "Tugs"
              : serviceType["PARAMETER_NAME"];
            portServiceArr.push({
              Amount: _item["Svc_Amount"],
              SeviceName: serviceName,
            });
          }
        }
        if (
          "eH1c3mklc3b19041f-1d0d-4290-88da-4a3992ba9574" ===
          _item["Services_Category"]
        ) {
          agentCharges = `${agentCharges}<tr>
          <td style="font-size:10pt;">${agentChargesCount}. ${
            serviceType["PARAMETER_NAME"]
          }</td>
          <td style="text-align:right;font-size:10pt;">${this.currencyFormate(
            _item["Svc_Amount"]
          )}</td>
         </tr>`;
          agentChargesCount++;
        }
        if (
          "FVwnbdW0877027d39-ce8b-4077-bd2a-47607b2587a8" ===
          _item["Services_Category"]
        ) {
          ownerCharges = `${ownerCharges}<tr>
          <td style="font-size:10pt;">${owerChargesCount}. ${
            serviceType["PARAMETER_NAME"]
          }</td>
          <td style="text-align:right;font-size:10pt;">${this.currencyFormate(
            _item["Svc_Amount"]
          )}</td>
         </tr>`;
          owerChargesCount++;
        }
      }
    });

    portServiceArr.map((_item) => {
      portCharges = `${portCharges}<tr>
          <td style="font-size:10pt;">${portChargesCount}. ${
        _item["SeviceName"]
      }</td>
          <td style="text-align:right;font-size:10pt;">${this.currencyFormate(
            _item["Amount"]
          )}</td>
         </tr>`;
      portChargesCount++;
    });
    let Deductable_Amount =
      this.fdaSummeryForm.get("Deductable_Amount").value || 0;
    const Exchange_Rate = this.fdaSummeryForm.get("Exchange_Rate").value;

    let USD_Amount = 0;
    if (Exchange_Rate) {
      console.log(fdaCurrency, total, Deductable_Amount, Exchange_Rate);
      if (fdaCurrency != "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a") {
        USD_Amount = total * Exchange_Rate - Deductable_Amount;
      } else {
        USD_Amount = (total - Deductable_Amount) * Exchange_Rate;
      }
    }
    const deductableCurrencies = this.currencyList.find(
      (c) => c["CURRENCY_GUID"] == fdaCurrency
    );
    const main_table = ` <thead>
    <tr>
        <th style="width:75%">DESCRIPTION</th>
        <th style="width:25%;text-align:right;" >AMOUNT SGD</th>
    </tr>
</thead>
<tbody>
  ${portChargesCount > 1 ? portCharges : ""}
  ${agentChargesCount > 1 ? agentCharges : ""}
  ${owerChargesCount > 1 ? ownerCharges : ""}
</tbody>
<tfoot>
  <tr>
    <td style='text-align:right;font-size:10pt;'>TOTAL SGD</td>
    <td style='text-align:right;font-size:10pt;'>${this.currencyFormate(
      total
    )}</td>
  </tr>
  <tr>
  <td style='text-align:right;font-size:10pt;'>OFFSET${
    deductableCurrencies ? ` ${deductableCurrencies["SHORT_CODE"]}` : ""
  }</td>
  <td style='text-align:right;font-size:10pt;'>${this.currencyFormate(
    Deductable_Amount
  )}</td>
</tr>
<tr>
  <td style='text-align:right;font-size:10pt;'>AMOUNT DUE SGD</td>
  <td style='text-align:right;font-size:10pt;'>${this.currencyFormate(
    total -
      (fdaCurrency != "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
        ? 0
        : Deductable_Amount)
  )}</td>
</tr>
${
  Exchange_Rate
    ? `<tr>
<td style='text-align:right;font-size:10pt;'>EXCHANGE RATE</td>
<td style='text-align:right;font-size:10pt;'>${Exchange_Rate}</td>
</tr>
<tr>
<td style='text-align:right;font-size:10pt;'>AMOUNT DUE USD</td>
<td style='text-align:right;font-size:10pt;'>${this.currencyFormate(
        USD_Amount
      )}</td>
</tr>`
    : ``
}
</tfoot>`;
    const remarks = this.fdaSummeryForm.get("Remarks").value || "";
    const footer = `<div class="col-md-12"></br>
<p class="mb-1" style='font-size:10pt;'>
  Amount payble in ${Exchange_Rate ? "USD" : "SGD"}: ${
      Exchange_Rate
        ? this.number2words(USD_Amount)
        : this.number2words(total - Deductable_Amount)
    } Only
</p>
</div>

<div class="col-md-12">
<p  style='font-size:10pt;'>Our banking details :-</p>
${
  `${fdaCurrency}` == "SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"
    ? `<p  style='font-size:8pt;'>
Seawave Shipping Services Pte Ltd </br>
United Overseas Bank Ltd</br>
230, Orchard Road</br>
#01-230, Faber House</br>
Singapore 238854</br>
SGD Account Number  : 380 302 7607</br>
Swift Code          : UOVBSGSG</br>
BENEFICIARY NAME    : SEAWAVE SHIPPING SERVICES PTE LTD</br>
COMPANY REG.        : 200607827M 
</p>`
    : `<p  style='font-size:8pt;'>
Seawave Shipping Services Pte Ltd</br>
UNITED OVERSEAS BANK LIMITED</br>
230, ORCHARD ROAD</br>
#01-230, FABER HOUSE</br>
SINGAPORE 238854</br>
 
USD ACCOUNT No. : 380 902 9075</br>
SWIFT CODE      : UOVBSGSG</br>
BENEFICIARY NAME: SEAWAVE SHIPPING SERVICES PTE LTD</br>
COMPANY REG.    : 200607827M
</p>`
}
</div>${
      remarks != ""
        ? `<p class="pdf-pagebreak-before">Invoice Remarks : ${remarks}</p>`
        : ""
    }`;
    let printFormHtml = `${this.printTemplate}`;
    printFormHtml = printFormHtml.replace(/{{header}}/g, header);
    printFormHtml = printFormHtml.replace(/{{main_table}}/g, main_table);
    return printFormHtml.replace(/{{footer}}/g, footer);
  }
  CloseModal() {}
  currencyFormate(number, exchange = 1) {
    if (number) {
      number = `${number}`.replace(/,/g, "");
      const num = (parseFloat(number) * exchange).toFixed(2);
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return number ? number : "";
  }

  number2words(n) {
    let negative = false;
    if (n < 0) {
      n = n * -1;
      negative = true;
    }
    n = n < 0 ? n * -1 : n;
    var nums = n.toString().split(".");
    var whole = this.convertNumberToWords(nums[0]);
    if (nums.length == 2) {
      var fraction = this.convertNumberToWords(
        nums[1].length == 1 ? `${nums[1]}0` : nums[1]
      );
      return `${negative ? "Minus " : ""}${whole} and ${fraction}`;
    } else {
      return `${negative ? "Minus " : ""}${whole}`;
    }
  }
  convertNumberToWords(amount) {
    console.log("Number to words ", amount);
    var words = new Array();
    words[0] = "";
    words[1] = "One";
    words[2] = "Two";
    words[3] = "Three";
    words[4] = "Four";
    words[5] = "Five";
    words[6] = "Six";
    words[7] = "Seven";
    words[8] = "Eight";
    words[9] = "Nine";
    words[10] = "Ten";
    words[11] = "Eleven";
    words[12] = "Twelve";
    words[13] = "Thirteen";
    words[14] = "Fourteen";
    words[15] = "Fifteen";
    words[16] = "Sixteen";
    words[17] = "Seventeen";
    words[18] = "Eighteen";
    words[19] = "Nineteen";
    words[20] = "Twenty";
    words[30] = "Thirty";
    words[40] = "Forty";
    words[50] = "Fifty";
    words[60] = "Sixty";
    words[70] = "Seventy";
    words[80] = "Eighty";
    words[90] = "Ninety";
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
      var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
      var received_n_array = new Array();
      for (var i = 0; i < n_length; i++) {
        received_n_array[i] = number.substr(i, 1);
      }
      for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
        n_array[i] = received_n_array[j];
      }
      for (var i = 0, j = 1; i < 9; i++, j++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          if (n_array[i] == 1) {
            n_array[j] = 10 + parseInt(`${n_array[j]}`);
            n_array[i] = 0;
          }
        }
      }
      let value = 0;
      for (var i = 0; i < 9; i++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          value = n_array[i] * 10;
        } else {
          value = n_array[i];
        }
        if (value != 0) {
          words_string += words[value] + " ";
        }
        if (
          (i == 1 && value != 0) ||
          (i == 0 && value != 0 && n_array[i + 1] == 0)
        ) {
          words_string += "Crores ";
        }
        if (
          (i == 3 && value != 0) ||
          (i == 2 && value != 0 && n_array[i + 1] == 0)
        ) {
          words_string += "Lakhs ";
        }
        if (
          (i == 5 && value != 0) ||
          (i == 4 && value != 0 && n_array[i + 1] == 0)
        ) {
          words_string += "Thousand ";
        }
        if (
          i == 6 &&
          value != 0 &&
          n_array[i + 1] != 0 &&
          n_array[i + 2] != 0
        ) {
          words_string += "Hundred and ";
        } else if (i == 6 && value != 0) {
          words_string += "Hundred ";
        }
      }
      words_string = words_string.split("  ").join(" ");
    }
    return words_string;
  }
}

@Component({
  selector: "address-select-dialog",
  templateUrl: "address-select-dialog.html",
})
export class AddressSelectionDialog {
  PLANNER_GUID: string = null;
  COMPANY_GUID: string = null;
  ADDRESS_LIST: Array<string> = [];
  ADDRESS_LIST_SEQ: Array<number> = [];
  SELECTED: number = -1;
  SELECTED_ADDRESS: string = "";
  companyAddressForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private dialogRef: MatDialogRef<AddressSelectionDialog>
  ) {}
  ngOnInit(): void {
    this.companyAddressForm = this.fb.group({
      New_Address: ["", Validators.required],
    });
    this.ADDRESS_LIST_SEQ = this.ADDRESS_LIST.map((_item, index) => {
      if (this.ADDRESS_LIST.length === 1) {
        this.companyAddressForm.addControl(
          "Address_" + index,
          this.fb.control(1)
        );
        this.SELECTED = index;
      } else {
        if (_item === this.SELECTED_ADDRESS) {
          this.SELECTED = index;
        }
        this.companyAddressForm.addControl(
          "Address_" + index,
          this.fb.control(_item === this.SELECTED_ADDRESS ? 1 : 0)
        );
      }
      return index;
    });
  }

  closeModal() {
    this.dialogRef.close(false);
  }
  radiobuttonClick(value, index) {
    this.SELECTED = index;
    this.companyAddressForm.get(`Address_${index}`).patchValue(value);
  }
  selectAddress() {
    this.updatePlanner(this.ADDRESS_LIST[this.SELECTED]);
  }
  updatePlanner(Company_Billing_Address) {
    this.api
      .PostDataService("fda/print/save", {
        Company_Billing_Address: Company_Billing_Address,
        plannerId: this.PLANNER_GUID,
      })
      .subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.dialogRef.close({
              list: JSON.stringify(this.ADDRESS_LIST),
              selected: Company_Billing_Address,
            });
          } else {
            this.common.ShowMessage(res["Message"], "notify-error", 6000);
          }
        },
        (error) => {
          this.common.ShowMessage(error["message"], "notify-error", 6000);
        }
      );
  }
  addNewAddress() {
    const New_Address = this.companyAddressForm.get(`New_Address`).value;
    if (!New_Address || New_Address === "") {
      this.common.ShowMessage("Address cannot be empty", "notify-error", 6000);
      return;
    }
    this.ADDRESS_LIST = [...this.ADDRESS_LIST, New_Address].filter(
      (_item) => _item && _item != ""
    );
    const payload = {
      ADDRESS_LIST_JSON: JSON.stringify(this.ADDRESS_LIST),
      COMPANY_GUID: this.COMPANY_GUID,
    };
    this.api.PostDataService("company/update-address", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          const addedItemIndex = this.ADDRESS_LIST_SEQ.length;
          this.ADDRESS_LIST_SEQ.push(addedItemIndex);
          this.companyAddressForm.get(`New_Address`).patchValue("");
          this.SELECTED = addedItemIndex;
          this.companyAddressForm.addControl(
            "Address_" + addedItemIndex,
            this.fb.control(1)
          );
          this.common.ShowMessage(res["Message"], "notify-success", 6000);
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
}
