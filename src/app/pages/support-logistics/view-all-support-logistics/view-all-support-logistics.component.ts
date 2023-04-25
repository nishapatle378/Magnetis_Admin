import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";

import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditSupportLogisticsComponent } from "../add-edit-support-logistics/add-edit-support-logistics.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";

import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";

import * as moment from "moment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UpdateDeliveryComponent } from "../update-delivery/update-delivery.component";
import { Title } from "@angular/platform-browser";
import { UpdateOutgoingAwbComponent } from "../update-outgoing-awb/update-outgoing-awb.component";
import Swal from "sweetalert2";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-support-logistics",
  templateUrl: "./view-all-support-logistics.component.html",
  styleUrls: ["./view-all-support-logistics.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllSupportLogisticsComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();

  @ViewChild("TABLE") table: ElementRef;

  PrincipalList: Array<object> = [];
  VesselList: Array<object> = [];
  printType: any = null;

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @Input()
  columns: ListColumn[] = [
    { property: "Log_Ref", visible: true, name: "REF" },
    { property: "Delivery_Ref", visible: true, name: "Delivery Ref" },
    { property: "Type_Name", visible: true, name: "Type" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel" },
    { property: "Description_Name", visible: true, name: "Description" },
    { property: "FollowUp", visible: true, name: "Follow Up" },
    { property: "Destination_Name", visible: true, name: "Destination" },
    { property: "Delivery_Date", visible: true, name: "Delivery Date" },
    { property: "Remarks", visible: true, name: "Remarks" },
    { property: "Outgoing_AWB", visible: true, name: "Outgoing AWB" },
    { property: "Status_GUID", visible: true, name: "Status" },
    { property: "Select", visible: true, name: "Select" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];

  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  typesList = [];
  recievedFromList = [];
  descriptionList = [];
  PlannerList = [];
  unitList = [];
  courierList = [];
  followUpList = [];
  destinationList = [];
  statusList = [];
  NewRefNumber = "";
  start = null;
  end = null;
  startDate = "";
  endDate = "";
  statusType = "";
  loading = false;
  recordsFilteredBy = [];
  selectedItem: Array<any> = [];
  protected _onDestroy = new Subject<void>();
  public filtered_type: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_recievedFrom: ReplaySubject<Array<object>> =
    new ReplaySubject<Array<object>>(1);
  public filtered_description: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_unit: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_courier: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_followUp: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_destination: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  host = window.location.protocol + "//" + window.location.host;

  printHtml = `<div class="container">
      <div class="row">
          <div class="col-12">
              <div class="card">
                  <div class="card-body p-0">
                      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}">
                        <tr>
                          <td style="width:50%"> <img height="80" width="300"  src="${this.host}/assets/img/Client_Logo.png"></td>
                          <td style="width:50%"> <p class="font-weight-bold mb-1"><strong>Westech Building, 237 Pandan Loop, #08-04,
                          </br>Singapore 128424, www.seawave.com.sg
                          </br>Tel: +65 68723915 | Fax: +65 68723914</strong></p></td>
                        </tr>
                      </table>
                      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}"><tr><td style="width:100%;background-color: #676767;padding: 3px;color:#fff;"><p style="width:100%;text-align:center;font-size:16pt;font-weight:bold">CARE OFF NOTE : {{title}}</p></td></tr></table>
                      <div class="row pb-5 p-5">
                          <div class="col-md-12">
                              {{report_of}}

                              <table>
                                  <thead>
                                      <tr>
                                          {{table_header}}
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {{table_data}}
                                  </tbody>
                              </table>
                          </div>
                          <div class="col-md-12"></br>
                            <p class="mb-1">
                              RECEIVED IN ORDER AND GOOD CONDITION
                            </p>
                            </br>
                            <p>________________________________</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `;
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
    this.titleService.setTitle(`Logistic list`);
  }
  filterFormGroup = null;
  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      VESSEL_GUID: [""],
      LOGISTIC_TYPE: [""],
      DESTINATION: [""],
      vessel_Filter: [""],
      company_Filter: [""],
      destination_Filter: [""],
      followup_Filter: [""],
      Followup_GUID: [""],
      LOGISTIC_STATUS: [""],
      SEARCH: [""],
      Out_Awb: [""],
    });
    this.getSysTemParameter();
    this.filterFormGroup
      .get("PRINCIPAL_GUID")
      .valueChanges.subscribe((PRINCIPAL_GUID) => {
        this.filtered_vessel.next(
          this.VesselList.filter(
            (item) => item["COMPANY_GUID"] === PRINCIPAL_GUID
          )
        );
      });
    this.filterFormGroup.controls["vessel_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "VESSEL_NAME",
          this.VesselList,
          this.filtered_vessel
        );
      });
    this.filterFormGroup.controls["company_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "COMPANY_NAME",
          this.PrincipalList,
          this.filtered_principal
        );
      });
    this.filterFormGroup.controls["destination_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.destinationList,
          this.filtered_destination
        );
      });
    this.filterFormGroup.controls["followup_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "PARAMETER_NAME",
          this.followUpList,
          this.filtered_followUp
        );
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  onClickSubmit(data) {
    if (data.DESTINATION) {
      this.recordsFilteredBy.push("destination");
    }
    if (data.PRINCIPAL_GUID) {
      this.recordsFilteredBy.push("principal");
    }
    if (data.VESSEL_GUID) {
      this.recordsFilteredBy.push("vessel");
    }
    const url = `support-logistic/get-all?principal=${
      data.PRINCIPAL_GUID ? data.PRINCIPAL_GUID : ""
    }&type=${data.LOGISTIC_TYPE ? data.LOGISTIC_TYPE : ""}&destination=${
      data.DESTINATION ? data.DESTINATION : ""
    }&status=${
      data.LOGISTIC_STATUS ? data.LOGISTIC_STATUS.join(",") : ""
    }&vessel=${data.VESSEL_GUID ? data.VESSEL_GUID : ""}&follow_up=${
      data.Followup_GUID ? data.Followup_GUID : ""
    }&search=${data.SEARCH ? data.SEARCH : ""}&search_awb=${
      data.Out_Awb ? data.Out_Awb : ""
    }`;
    this.FetchAllSupportLogistics(url);
  }
  clearFilter() {
    this.loading = true;
    this.filterFormGroup.reset();
    const status = this.statusList
      .map((_item) => _item["PARAMETER_GUID"])
      .filter(
        (_status) =>
          !["WdVGpZR7Z94675122-4e9c-40d7-80dd-e01f2893400b"].includes(_status)
      );
    this.filterFormGroup.get("LOGISTIC_STATUS").setValue(status);
    this.recordsFilteredBy = [];
    this.FetchAllSupportLogistics();
  }

  FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
      r = "0" + r;
    }
    return r;
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Support-Logistics.xlsx");
  }
  onPrintChange(event: any) {
    this.printType = event.value;
  }
  PrintDetail() {
    if (this.printType === "delivery_to_vessel") {
      if (this.recordsFilteredBy.includes("vessel")) {
        //Delivery to vesel
        this.checkForDeliveryDate("vessel");
      } else {
        Swal.fire({
          template: "#my-template",
          title: "Please filter records by vessel",
          text: "",
          icon: "warning",
          showCancelButton: true,
          showConfirmButton: false,
          cancelButtonColor: "#d33",
          cancelButtonText: "Close",
          backdrop: false,
        }).then((result) => {});
      }
    } else if (
      this.printType === "delivery" ||
      this.printType === "collection"
    ) {
      if (this.recordsFilteredBy.includes("destination")) {
        //print deivery to collection
        this.checkForDeliveryDate("destination");
      } else {
        Swal.fire({
          template: "#my-template",
          title: "Please filter records by destination",
          text: "",
          icon: "warning",
          showCancelButton: true,
          showConfirmButton: false,
          cancelButtonColor: "#d33",
          cancelButtonText: "Close",
          backdrop: false,
        }).then((result) => {});
      }
    } else {
      Swal.fire({
        template: "#my-template",
        title: "Please select print type",
        text: "",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonColor: "#d33",
        cancelButtonText: "Close",
        backdrop: false,
      }).then((result) => {});
    }
  }
  checkForDeliveryDate(printType) {
    // const emptyDeliveryDate = this.AllData.filter(_item => _item['Delivery_date'] === null || _item['Delivery_date'] === '')
    //   if(emptyDeliveryDate.length){

    //   }else{

    //   }
    const dialogRef = this.dialog.open(UpdateDeliveryComponent, {
      width: "50%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.logisticIds = this.AllData.map(
      (_item) => _item["Logistics_GUID"]
    );
    dialogRef.componentInstance.selectedLogisticData = this.AllData;
    dialogRef.componentInstance.onlyDeliveryData = true;
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        this.selectedItem = [];
        this.onClickSubmit(this.filterFormGroup.value);
        if (printType === "vessel") {
          this.printDeliverTovessel(res.Delivery_Date, res.refNumber);
        } else {
          this.printDeliveryToCollection(res.Delivery_Date, res.refNumber);
        }
      }
    });
  }
  printDeliveryToCollection(delivery_date, refNumber) {
    const destination = this.destinationList.filter(
      (item) =>
        item["PARAMETER_GUID"] === this.filterFormGroup.get("DESTINATION").value
    );
    let finalString = this.printHtml.replace(
      /{{title}}/g,
      this.printType === "delivery" ? "DELIVERY" : "COLLECTION"
    );
    finalString = finalString.replace(
      /{{table_header}}/g,
      `<th style="width:5%;background-color: #676767;padding: 5px;color:#fff">NO</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Vessel Name</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Description</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Remark</th>
    <th style="width:15%;background-color: #676767;padding: 5px;color:#fff">Quantity</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Principal Ref</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">AWB</th>`
    );

    finalString = finalString.replace(
      /{{report_of}}/g,
      `<p class="mb-1">DESTINATION &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${
        destination.length ? destination[0]["PARAMETER_NAME"] : ""
      }</p>
    <p class="mb-1">DELIVERY DATE  &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${moment(
      delivery_date
    ).format("DD MMM YYYY")}</p></br></br>`
    );

    const table = this.AllData.map(
      (item, index) =>
        `<tr><td>${index + 1}</td><td>${item["VESSEL_NAME"] || ""}</td><td>${
          item["DESCRIPTION_NAME"]
            ? item["DESCRIPTION_NAME"]
            : item["Description"] || ""
        }</td><td>${item["Remarks"] || ""}</td><td>${
          item["Log_Quantity"] || ""
        }</td><td>${item["Principal_Ref"] || ""}</td><td>${
          item["AWB"] || ""
        }</td></tr>`
    ).join("");

    finalString = finalString.replace(/{{table_data}}/g, table);
    this.downloadAsPDF(finalString);
  }
  printDeliverTovessel(delivery_date, refNumber) {
    const vessel = this.VesselList.filter(
      (item) =>
        item["VESSEL_GUID"] === this.filterFormGroup.get("VESSEL_GUID").value
    );

    let finalString = this.printHtml.replace(
      /{{title}}/g,
      "DELIVERY TO VESSEL"
    );
    finalString = finalString.replace(
      /{{table_header}}/g,
      `<th style="width:5%;background-color: #676767;padding: 5px;color:#fff">NO</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Received From</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Description</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Remark</th>
    <th style="width:15%;background-color: #676767;padding: 5px;color:#fff">Quantity</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">Principal Ref</th>
    <th style="width:16%;background-color: #676767;padding: 5px;color:#fff">AWB</th>`
    );

    finalString = finalString.replace(
      /{{report_of}}/g,
      `<p class="mb-1">PRINCIPAL &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; ${
        vessel[0]["COMPANY_NAME"] || ""
      }</p>
    <p class="mb-1">VESSEL NAME  &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${
      vessel[0]["VESSEL_NAME"] || ""
    }</p>
    <p class="mb-1">DELIVERY DATE &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${moment(
      delivery_date
    ).format("DD MMM YYYY")}</p>
    <p class="mb-1">DELIVERY Ref &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; ${refNumber}</p></br></br>`
    );

    const table = this.AllData.map(
      (item, index) =>
        `<tr><td>${index + 1}</td><td>${
          item["Recieved_From_Name"] || ""
        }</td><td>${
          item["DESCRIPTION_NAME"]
            ? item["DESCRIPTION_NAME"]
            : item["Description"] || ""
        }</td><td>${item["Remarks"] || ""}</td><td>${
          item["Log_Quantity"] || ""
        }</td><td>${item["Principal_Ref"] || ""}</td><td>${
          item["AWB"]
        }</td></tr>`
    ).join("");

    finalString = finalString.replace(/{{table_data}}/g, table);
    this.downloadAsPDF(finalString);
  }
  public downloadAsPDF(finalPdf: string) {
    var html = htmlToPdfmake(finalPdf, {
      imagesByReference: true,
      tableAutoSize: true,
    });
    const documentDefinition = {
      content: html.content,
      images: html.images,
      pageOrientation: "landscape",
      pageMargins: [40, 40, 40, 40],
      styles: {
        header: {
          fontSize: 14,
          bold: true,
        },
        cell: {
          color: "red",
          fillColor: "yellow",
        },
      },
    };
    pdfMake.createPdf(documentDefinition).open();
  }
  FetchAllSupportLogistics(url = null) {
    if (!url) {
      const status = this.statusList
        .map((_item) => _item["PARAMETER_GUID"])
        .filter(
          (_status) =>
            !["WdVGpZR7Z94675122-4e9c-40d7-80dd-e01f2893400b"].includes(_status)
        );
      url = `support-logistic/get-all?status=${status.join(",")}`;
    }
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          if (res["Data"]) {
            this.AllData = res["Data"];
            this.dataSource.data = res["Data"];
            if (!this.PrincipalList.length) {
              this.loadSelectableData();
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
  SelectRecord(selected, log_id) {
    if (selected) {
      this.selectedItem.push(log_id);
    } else {
      this.selectedItem = this.selectedItem.filter((i) => i != log_id);
    }
  }
  SelectAllLog(select) {
    if (select) {
      this.AllData.map((i) => {
        this.selectedItem.push(i["Logistics_GUID"]);
        return i;
      });
    } else {
      this.selectedItem = [];
    }
  }
  Save(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditSupportLogisticsComponent, {
      width: "70%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.componentInstance.NewRefNumber = this.NewRefNumber;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }
  UpdateDelivery() {
    const dialogRef = this.dialog.open(UpdateDeliveryComponent, {
      width: "50%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.logisticIds = this.selectedItem;
    dialogRef.componentInstance.selectedLogisticData = this.AllData.filter(
      (_item) => this.selectedItem.includes(_item["Logistics_GUID"])
    );
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.selectedItem = [];
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }
  getFileURL(fileName) {
    return `${this.api.API_HOST}${fileName}`;
  }
  UpdateAWB() {
    const dialogRef = this.dialog.open(UpdateOutgoingAwbComponent, {
      width: "50%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.logisticIds = this.selectedItem;
    dialogRef.componentInstance.selectedLogisticData = this.AllData.filter(
      (_item) => this.selectedItem.includes(_item["Logistics_GUID"])
    );
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.selectedItem = [];
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }

  getSysTemParameter() {
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.recievedFromList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "JgOO5W5rR08880ed4-856e-4209-861e-6403be1a64ac"
      );
      this.typesList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "0AWw8rhJF02eca503-4e2f-4182-a231-b4a4e85416a5"
      );
      this.descriptionList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "W2Ek6Lag486806328-f38b-4cb3-af0a-84380a8af5ba"
      );
      this.unitList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "qGeYGifEvd95562a0-6567-46b3-888c-4746f5a8f920"
      );
      this.followUpList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "ZmfEjWmux28983edd-5b8c-453d-8a63-e8da49bec320"
      );
      this.destinationList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "qoyVliwes8a2fb2de-7459-4e41-a307-1a35494bcfbd"
      );
      this.courierList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "vsar359bN936ec994-0683-4894-bdd7-04bbf17abe19"
      );
      //Status List
      this.statusList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Ne9T07SH10acc4f88-02fd-4fc2-a46f-69c2b7d4589b"
      );
      this.filtered_type.next(this.typesList);
      this.filtered_recievedFrom.next(this.recievedFromList);
      this.filtered_description.next(this.descriptionList);
      this.filtered_unit.next(this.unitList);
      this.filtered_followUp.next(this.followUpList);
      this.filtered_destination.next(this.destinationList);
      this.filtered_courier.next(this.courierList);
      this.filtered_status.next(this.statusList);
      const status = this.statusList
        .map((_item) => _item["PARAMETER_GUID"])
        .filter(
          (_status) =>
            !["WdVGpZR7Z94675122-4e9c-40d7-80dd-e01f2893400b"].includes(_status)
        );
      this.filterFormGroup.get("LOGISTIC_STATUS").setValue(status);
    }
    this.FetchAllSupportLogistics();
  }

  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["vessels", "company"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.VesselList = res["Data"].vessels;
          this.PrincipalList = res["Data"].company;
          this.filtered_vessel.next(this.VesselList);
          this.filtered_planner.next(this.PlannerList);
          this.filtered_principal.next(this.PrincipalList);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  ngOnDestroy() {}

  delete(data: object) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          let post = { Logistics_GUID: data["Logistics_GUID"] };
          const url = `support-logistic/delete`;
          this.api.DeleteDataService(url, post).subscribe(
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
  UpdateStatus() {
    const dialogRef = this.dialog.open(UpdateBulkStatusDialog, {
      width: "30%",
      maxHeight: "90%",
      disableClose: true,
    });
    dialogRef.componentInstance.logIds = this.selectedItem;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.selectedItem = [];
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }
}
@Component({
  selector: "alert-dialog",
  templateUrl: "alert-dialog.html",
})
export class AlertDialog {
  message: string = null;
  constructor(private dialogRef: MatDialogRef<AlertDialog>) {}
  CloseModal() {
    this.dialogRef.close(true);
  }
}

@Component({
  selector: "update-bulk-status",
  templateUrl: "update-bulk-status.html",
})
export class UpdateBulkStatusDialog {
  logIds = [];
  logisticForm: FormGroup;
  public filtered_status: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private dialogRef: MatDialogRef<UpdateBulkStatusDialog>
  ) {}
  ngOnInit(): void {
    this.logisticForm = this.fb.group({
      Status_GUID: ["", Validators.required],
    });

    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    this.filtered_status.next(
      sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Ne9T07SH10acc4f88-02fd-4fc2-a46f-69c2b7d4589b"
      )
    );
  }

  closeModal() {
    this.dialogRef.close(false);
  }

  updateStatus() {
    this.api
      .PostDataService("support-logistic/bulk/update", {
        Logistic_Ids: this.logIds,
        Status_GUID: this.logisticForm.value.Status_GUID,
      })
      .subscribe(
        (res) => {
          if (res["Status"] === 200) {
            this.dialogRef.close(true);
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
