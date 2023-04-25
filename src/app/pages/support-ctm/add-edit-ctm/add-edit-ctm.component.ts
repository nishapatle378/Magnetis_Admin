import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import { Subject, ReplaySubject } from "rxjs";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { TransferVesselComponent } from "../transfer-vessel/transfer-vessel.component";
import { EmailToVendorComponent } from "../email-to-vendor/email-to-vendor.component";

import jsPDF from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from "html-to-pdfmake";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import Swal from "sweetalert2";
import { Title } from "@angular/platform-browser";
export const MY_FORMATS = {
  parse: {
    dateInput: "L",
  },
  display: {
    dateInput: "DD MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "fury-add-edit-ctm",
  templateUrl: "./add-edit-ctm.component.html",
  styleUrls: ["./add-edit-ctm.component.scss"],
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
export class AddEditCtmComponent implements OnInit {
  @ViewChild("denomination") pdfTable: ElementRef;
  protected _onDestroy = new Subject<void>();
  static id = 100;

  form: FormGroup;
  submit: boolean = false;
  hideUpload = false;

  isLinear = true;
  firstFormGroup: FormGroup;
  ctmStatus = 0;
  EditData: object = null;
  selectedVendor: object = null;
  IsEdit: boolean = false;
  readOnly: boolean = false;
  VesselList = [];
  PlannerList = [];
  CtmVendorList = [];
  PortList = [];
  CompanyList = [];
  PicList = [];
  dimonArray = [];
  ctmForm: FormGroup;
  ErrorMessage: string = "";
  Remittance_Received_Attach = false;
  CTM_Ordered_Attach = false;
  CTM_in_Office_Attach = false;
  CTM_with_agent_Attach = false;
  Vessel_Acknowledgement_Attach = false;
  selectedPlannerDetails = null;
  NewRefNumber = "";
  Services_GUID = null;
  public filtered_vessel: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_planner: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_port: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_company: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_ctm_vendors: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_ctm_pic: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  host = window.location.protocol + "//" + window.location.host;
  stringHtml = `<p>Dear {{vendor}},</p><p>Kindly arrange CTM of USD {{total_ctm_amount}} for vessel {{vessel_name}} as per below Denominations.</p>{{denomination}}<p>Total USD Amount: <strong>{{total_amount}}</strong></p><p>1) We will pass you a {{currency}} cheque basis Handling fee of:  <strong>USD {{handling_fee}}%</strong></p><p>2) Accordingly Total {{currency}} Amount due to you: <strong>{{total_amount_usd}}</strong></p><br /><p>Remarks : {{remarks}}</p><br /><p>Please confirm safe receipt.</p><p><strong>Best Regards</strong></p><p>{{user_name}}</p><p>SEAWAVE SHIPPING SERVICES PTE LTD</p><p>GENERAL OFFICE TEL  : +65 68723915 ext 111</p>`;
  stringSgdHtml = `<p>Dear {{vendor}},</p><p>Kindly arrange CTM of USD {{total_ctm_amount}} for vessel {{vessel_name}} as per below Denominations.</p>{{denomination}}<p>Total USD Amount: <strong>{{total_amount}}</strong></p><p>1) We will pass you a {{currency}} cheque basis exchange rate of:  <strong> </strong></p><p>2) Accordingly Total {{currency}} Amount due to you: <strong></strong></p><br /><p>Remarks : {{remarks}}</p><br /><p>Please confirm safe receipt.</p><p><strong>Best Regards</strong></p><p>{{user_name}}</p><p>SEAWAVE SHIPPING SERVICES PTE LTD</p><p>GENERAL OFFICE TEL  : +65 68723915 ext 111</p>`;
  printFormHtml = `<div class="container">
      <div class="row">
          <div class="col-12">
              <div class="card">
                  <div class="card-body p-0">
                      <table data-pdfmake="{&quot;layout&quot;:&quot;noBorders&quot;}" style="height:100pt">
                        <tr>
                          <td style="width:50%"> <img height="80" width="300"  src="${this.host}/assets/img/Client_Logo.png"></td>
                          <td style="width:50%"> <p><strong>Westech Building, 237 Pandan Loop, #08-04,
                          </br>Singapore 128424, www.seawave.com.sg
                          </br>Tel: +65 68723915 | Fax: +65 68723914</strong></td>
                        </tr>
                      </table><hr/><div class="row pb-5 p-5">
                          <div class="col-md-12">
                              <p class="mb-1">Date &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {{date}}</p>
                              <p class="mb-1">To &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Captain OF {{vessel_name}}</p>
                              <p class="mb-1">Re &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Supply of CTM in the amount of USD {{total_ctm_amount}}</p></br>
                            <div class="col-md-12"></br>
                              <p class="mb-1">
                                I hereby confirm the receipt of CTM in the amount of USD {{total_ctm_amount}} as per the denominations stated below :
                              </p>
                            </div>
                              <table>
                                  <thead>
                                      <tr>
                                          <th style="width:25%" class="border-0 text-uppercase small font-weight-bold"><u>Nos</u></th>
                                          <th style="width:25%" class="border-0 text-uppercase small font-weight-bold"><u>USD Bill</u></th>
                                          <th style="width:25%" class="border-0 text-uppercase small font-weight-bold"><u>Total</u></th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                     {{denomination}}
                                  </tbody>
                              </table>
                          </div>
                          <p>TOTAL :USD {{total_ctm_amount}}</p>
                          <div class="col-md-12"></br>
                            <p class="mb-1">
                              <u>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</u>
                            </br>Name of Master &nbsp; &nbsp; &nbsp; &nbsp;:
                            </br>Name of Vessel &nbsp; &nbsp; &nbsp; &nbsp; : {{vessel_name}}
                            </br>Receive Date / Time  :
                            </p>
                          </div>
                          <div class="col-md-12"></br>
                            <p class="mb-1">Witnessed By :-</p>
                            <p class="mb-1">
                              <u>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</u>
                            </br>Name of Agent  &nbsp; &nbsp; &nbsp; &nbsp;:
                            </br>Date / Time &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;:
                            </br></br>1 copy - Master
                            </br>1 copy - Agent
                            </br>1 copy - Owner
                            </p>
                            <p style="text-align:center"><span style="font-size: 8.5pt">F-SWS-AGY-19/Release 4-11.2013</span></p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `;
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private route: ActivatedRoute,
    private titleService: Title
  ) {
    this.titleService.setTitle(`Update CTM`);
  }

  ngOnInit(): void {
    this.ctmForm = this.fb.group({
      CTM_GUID: [""],
      CTM_REF: [""],
      Vessel_GUID: ["", Validators.required],
      Service_GUID: [""],
      Planner_GUID: ["", Validators.required],
      PORT_GUID: [""],
      COMPANY_GUID: [""],
      PORT_NAME: [""],
      COMPANY_NAME: [""],
      Vessel_NAME: [""],
      ETA: [""],
      PIC: [""],
      Status_GUID: ["EeqmCauXUae3fe5b8-e6cf-4b90-a562-f526e4521662"],
      Remittance_Received: [""],
      CTM_Ordered: [""],
      CTM_in_Office: [""],
      CTM_with_agent: [""],
      Vessel_Acknowledgement: [""],
      Amount_Remitted_Back_To_Client: [""],
      Cancelled_Request: [""],
      Transfer_To_New_Vessel: [""],
      Closed_Request: [""],
      Remittance_Received_Attach: [""],
      CTM_Ordered_Attach: [""],
      CTM_in_Office_Attach: [""],
      CTM_with_agent_Attach: [""],
      Vessel_Acknowledgement_Attach: [""],
      Amount_Remitted_Back_To_Client_Attach: [""],
      Cancelled_Request_Attach: [""],
      Transfer_To_New_Vessel_Attach: [""],
      Closed_Request_Attach: [""],
      USD_Amount_Due: [0.0],
      Remarks: [""],
      CTM_PIC: [""],
      Total_Amount: [0],
      Handling_Fee: [0],
      Amount_Due: [0],
      Amount_Recieved: [0.0],
      Date_Recieved: [""],
      Amount_Due_USD: [0.0],
      Applicable_Exchange: [1.4],
      Amount_Due_SGD: [0.0],
      Vendor_GUID: [""],
      Vendor_Name: [""],
      VENDOR_HANDLING_FEE: [0.0],
      Total_Due_Amt_USD: [0.0],
      Total_Amount_Planner: [0.0],
      Billable: [""],
      Planner_Filter: [""],
    });
    let thisVar = this;
    this.getDimonitationScale();
    this.ctmForm.get("Planner_GUID").valueChanges.subscribe((plannerValue) => {
      let selectedPlanner = this.PlannerList.find(
        (planner) => planner["GUID"] == plannerValue
      );
   
      if (selectedPlanner) {
        this.selectedPlannerDetails = selectedPlanner;
        thisVar.ctmForm
          .get("Vessel_GUID")
          .setValue(selectedPlanner["VESSEL_GUID"]);
        thisVar.ctmForm
          .get("COMPANY_GUID")
          .setValue(selectedPlanner["PRINCIPAL_GUID"]);
        thisVar.ctmForm.get("PORT_GUID").setValue(selectedPlanner["PORT_GUID"]);
        thisVar.ctmForm
          .get("ETA")
          .patchValue(
            selectedPlanner["VESSEL_ETA"]
              ? new Date(selectedPlanner["VESSEL_ETA"])
              : "-"
          );
      }
    });

    this.ctmForm.get("Vendor_GUID").valueChanges.subscribe((vendorID) => {
      this.updateVenorHandelingFee(vendorID);
    });
    this.ctmForm.get("Billable").valueChanges.subscribe((Total_Amount) => {
      thisVar.updateAmountCalculation(thisVar);
    });
    this.ctmForm
      .get("Handling_Fee")
      .valueChanges.subscribe(function (handlingFee) {
        thisVar.updateAmountCalculation(thisVar);
      });

    this.ctmForm
      .get("Amount_Recieved")
      .valueChanges.subscribe(function (recievedAmt) {
        thisVar.updateAmountCalculation(thisVar);
      });
    this.ctmForm
      .get("Applicable_Exchange")
      .valueChanges.subscribe(function (exRate) {
        let Amount_Due = thisVar.ctmForm.get("USD_Amount_Due").value || 0;
        exRate = exRate ? parseFloat(exRate) : 0;
        thisVar.ctmForm.get("Amount_Due_SGD").patchValue(exRate * Amount_Due);
      });
    this.ctmForm.get("Total_Due_Amt_USD").valueChanges.subscribe((value) => {
      thisVar.ctmForm.get("Total_Amount_Planner").patchValue(value);
    });
    this.ctmForm.get("Remittance_Received").valueChanges.subscribe((value) => {
      this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 1;
      this.ctmForm
        .get("Status_GUID")
        .patchValue("RWmiCYWYR34e45cc9-3b4d-452c-97df-95bd24245b65");
    });
    this.ctmForm.get("CTM_Ordered").valueChanges.subscribe((value) => {
      if (
        this.ctmForm.get("Remittance_Received").value === "" ||
        this.ctmForm.get("Remittance_Received").value === null
      ) {
        this.ctmForm
          .get("Status_GUID")
          .patchValue("btAzISrMDbb0a2c96-8235-4feb-b87d-0527b4ef4781");
      } else {
        this.ctmForm
          .get("Status_GUID")
          .patchValue("RWmiCYWYR34e45cc9-3b4d-452c-97df-95bd24245b65");
      }
    });
    this.ctmForm.get("CTM_in_Office").valueChanges.subscribe((value) => {
      this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 3;
      this.ctmForm
        .get("Status_GUID")
        .patchValue("5rGlinpfw47d599cc-1d92-4cff-9f7b-c44aae8f4cd8");
    });
    this.ctmForm.get("CTM_with_agent").valueChanges.subscribe((value) => {
      this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 4;
      this.ctmForm
        .get("Status_GUID")
        .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
    });
    this.ctmForm
      .get("Vessel_Acknowledgement")
      .valueChanges.subscribe((value) => {
        this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 5;
        this.ctmForm
          .get("Status_GUID")
          .patchValue("0enl3NMHn522f709d-a6a3-49bb-946f-a19e6128391d");
      });
    this.ctmForm
      .get("Amount_Remitted_Back_To_Client")
      .valueChanges.subscribe((value) => {
        this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 6;
        this.ctmForm
          .get("Status_GUID")
          .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
      });
    this.ctmForm.get("Cancelled_Request").valueChanges.subscribe((value) => {
      this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 7;
      this.ctmForm
        .get("Status_GUID")
        .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
    });
    this.ctmForm
      .get("Transfer_To_New_Vessel")
      .valueChanges.subscribe((value) => {
        this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 8;
        this.ctmForm
          .get("Status_GUID")
          .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
      });
    this.ctmForm.get("Closed_Request").valueChanges.subscribe((value) => {
      this.ctmStatus = this.ctmStatus > value ? this.ctmStatus : 9;
      this.ctmForm
        .get("Status_GUID")
        .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
    });
    const CTM_ID = this.route.snapshot.paramMap.get("id");
    const SERVICE_ID = this.route.snapshot.paramMap.get("service_id");
    if (CTM_ID) {
      this.insertIntoFormData("CTM_GUID", CTM_ID);
      this.IsEdit = true;
    } else {
      if (SERVICE_ID) {
        this.IsEdit = true;
        this.insertIntoFormData("Service_GUID", SERVICE_ID);
      } else {
        this.generateRefNumber();
      }
    }
  }
  // setOrderCTMStatus() {
  //   switch (this.ctmStatus) {
  //     case 9:
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c");
  //       break;
  //     case 8:
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("9PovKGXNF7bdbfcce-4d0a-413a-bcf3-d9e4f5dad2c0");
  //       break;
  //     case 7:
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("kh2buGgqda2d18f85-ede8-4169-9e86-b2f731eb92f3");
  //       break;
  //     case 6:
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("MoZq47qzm78c0f2d9-aaa5-4315-adb0-0bbba66126d7");
  //       break;
  //     case 5:
  //       //Acknowledged
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("0enl3NMHn522f709d-a6a3-49bb-946f-a19e6128391d");
  //       break;
  //     case 4:
  //       //Ordered/Awaiting Remittance
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("btAzISrMDbb0a2c96-8235-4feb-b87d-0527b4ef4781");
  //       break;
  //     case 3:
  //       //In Office
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("5rGlinpfw47d599cc-1d92-4cff-9f7b-c44aae8f4cd8");
  //       break;
  //     case 2:
  //       //Awaiting CTM
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("RWmiCYWYR34e45cc9-3b4d-452c-97df-95bd24245b65");
  //       break;
  //     case 1:
  //       //To Order
  //       this.ctmForm
  //         .get("Status_GUID")
  //         .patchValue("W8uE7hlfza7bcfaf6-0c92-432c-82c2-18542ff91b11");
  //       break;
  //     default:
  //       break;
  //   }
  // }
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
  updateAmountCalculation(thisVar) {
    try {
      const Total_Amount = thisVar.ctmForm.get("Billable").value
        ? parseFloat(thisVar.ctmForm.get("Billable").value)
        : 0;
      const handlingFee = thisVar.ctmForm.get("Handling_Fee").value
        ? parseFloat(thisVar.ctmForm.get("Handling_Fee").value)
        : 0;
      const exRate = thisVar.ctmForm.get("Applicable_Exchange").value
        ? parseFloat(thisVar.ctmForm.get("Applicable_Exchange").value)
        : 1.4;
      const recievedAmt = thisVar.ctmForm.get("Amount_Recieved").value
        ? parseFloat(thisVar.ctmForm.get("Amount_Recieved").value)
        : 0;

      let handlingFeeTotal = ((handlingFee * Total_Amount) / 100).toFixed(2);
      let Total_Amount_Due = parseFloat(handlingFeeTotal) + Total_Amount;
      thisVar.ctmForm.get("Amount_Due").patchValue(Total_Amount_Due);

      thisVar.ctmForm
        .get("USD_Amount_Due")
        .patchValue((Total_Amount_Due - recievedAmt).toFixed(2));
      const Amount_Due = Total_Amount_Due - recievedAmt;
      // let exValue = (exRate * Amount_Due) / 100;
      // let totaAmt = exValue + Amount_Due;
      thisVar.ctmForm.get("Amount_Due_SGD").patchValue(exRate * Amount_Due);
    } catch (error) {
      console.log("Error in setting amount ", error);
    }
  }
  formatEmailHtml(string: string, pdf = true, currency = "USD") {
    const vendor = this.CtmVendorList.find(
      (v) => v["Vendor_GUID"] === this.ctmForm.get("Vendor_GUID").value
    );
    const Handling_Fee = vendor["Handling_Fee"] ? vendor["Handling_Fee"] : 0;
    string = string.replace(
      /{{vendor}}/g,
      this.ctmForm.get("Vendor_Name").value.toUpperCase()
    );
    string = string.replace(
      /{{exchange_rate}}/g,
      this.ctmForm.get("Applicable_Exchange").value
    );
    string = string.replace(
      /{{pic}}/g,
      this.ctmForm.get("Vendor_Name").value || ""
    );
    string = string.replace("{{currency}}", currency);
    string = string.replace("{{currency}}", currency);
    string = string.replace(
      /{{total_ctm_amount}}/g,
      this.numberWithCommas(this.ctmForm.get("Total_Amount").value)
    );
    string = string.replace(
      /{{vessel_name}}/g,
      this.selectedPlannerDetails?.VESSEL_NAME.toUpperCase() || ""
    );

    string = string.replace(
      /{{total_amount}}/g,
      this.numberWithCommas(this.ctmForm.get("Total_Amount").value)
    );
    console.log(this.ctmForm.get("Total_Amount"));
    string = string.replace(
      /{{handling_fee}}/g,
      this.numberWithCommas(Handling_Fee)
    );
    string = string.replace(
      /{{remarks}}/g,
      this.ctmForm.get("Remarks").value || ""
    );
    const amount = this.ctmForm.get("Total_Amount").value;
    let totalAMount = 0;
    if (currency === "USD") {
      totalAMount = (amount / 100) * Handling_Fee + amount;
    } else {
      const exchangeRate = this.ctmForm.get("Applicable_Exchange").value
        ? this.ctmForm.get("Applicable_Exchange").value
        : 0;
      totalAMount = amount * exchangeRate;
    }

    string = string.replace(
      /{{total_amount_usd}}/g,
      `${currency} ${this.numberWithCommas(totalAMount)}`
    );
    string = string.replace(
      /{{date}}/g,
      this.ctmForm.get("Date_Recieved").value
        ? _moment(this.ctmForm.get("Date_Recieved").value).format("DD MMM YYYY")
        : _moment().format("DD MMM YYYY")
    );
    const userData = JSON.parse(localStorage.getItem("AdminData"));
    string = string.replace(
      /{{user_name}}/g,
      userData.user_data.USER_FIRST_NAME
    );
    let table = "";
    if (pdf) {
      table = `
        ${this.dimonArray
          .map(
            (dimon, index) => `<tr>
        <td>${
          this.ctmForm.get("Quantity_" + dimon.PARAMETER_SHORT_NAME).value
        }</td>
        <td>${
          this.ctmForm.get("Bill_" + dimon.PARAMETER_SHORT_NAME).value
        } USD</td>
        <td> ${this.numberWithCommas(
          this.ctmForm.get("Total_" + dimon.PARAMETER_SHORT_NAME).value
        )} </td>
      </tr>`
          )
          .join("")}`;
    } else {
      table = `{<p>Nos x USD Bill = Total</p>${this.dimonArray
        .map((dimon) =>
          this.ctmForm.get("Quantity_" + dimon.PARAMETER_SHORT_NAME).value > 0
            ? `<p> ${
                this.ctmForm.get("Quantity_" + dimon.PARAMETER_SHORT_NAME).value
              } x USD ${
                this.ctmForm.get("Bill_" + dimon.PARAMETER_SHORT_NAME).value
              } bills =${this.numberWithCommas(
                this.ctmForm.get("Total_" + dimon.PARAMETER_SHORT_NAME).value
              )}</p>`
            : ""
        )
        .join("")}}`;
    }

    string = string.replace(/{{denomination}}/g, table);
    return string;
  }
  numberWithCommas(number, exchange = 1) {
    if (number) {
      number = `${number}`.replace(/,/g, "");
      const num = (parseFloat(number) * exchange).toFixed(2);
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return number ? number : "";
  }
  updateVenorHandelingFee(vendorId) {
    let vendorData = this.CtmVendorList.find(
      (item) => item["Vendor_GUID"] == vendorId
    );

    this.selectedVendor = vendorData;
    if (vendorData) {
      let totalAmt = this.ctmForm.get("Total_Amount").value;
      if (totalAmt >= 0) {
        const handling_fee = vendorData["Handling_Fee"]
          ? vendorData["Handling_Fee"]
          : 0;
        let vendorHandlingFee = (parseFloat(handling_fee) * totalAmt) / 100;
        this.ctmForm.get("VENDOR_HANDLING_FEE").patchValue(vendorHandlingFee);
        this.ctmForm.get("Vendor_Name").patchValue(vendorData["Vendor_Name"]);
        this.ctmForm
          .get("Total_Due_Amt_USD")
          .patchValue(totalAmt + vendorHandlingFee);
      }
    }
  }
  files: any = [];
  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }
  public downloadAsPDF() {
    const doc = new jsPDF();
    const finalPdf = this.formatEmailHtml(this.printFormHtml);
    var html = htmlToPdfmake(finalPdf, {
      imagesByReference: true,
      tableAutoSize: true,
    });
    const documentDefinition = {
      content: html.content,
      images: html.images,
    };
    pdfMake.createPdf(documentDefinition).open();
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }
  generateRefNumber() {
    this.api
      .GetDataService("common/get-ref?s=TBL_DTL_SUPPORT_CTM")
      .subscribe((res) => {
        if (res["Status"] == 200) {
          this.NewRefNumber = res["Data"].ref_number;
          this.ctmForm.get("CTM_REF").patchValue(this.NewRefNumber);
          this.loadSelectableData();
        }
      });
  }
  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  transferToVessleInvoke() {
    const dialogRef = this.dialog.open(TransferVesselComponent, {
      width: "50%",
      maxHeight: "50%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = this.EditData;
    dialogRef.componentInstance.IsEdit = this.IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        console.log(data);
      }
    });
  }

  insertIntoFormData(type = "CTM_GUID", GUID: string) {
    var fc: object = this.ctmForm.controls;
    this.api.GetDataService(`support-ctm/get/${type}/${GUID}`).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          const data = res["Data"];

          fc["CTM_GUID"].setValue(data["CTM_GUID"]);
          fc["Planner_GUID"].setValue(data["Planner_GUID"]);
          fc["Vessel_GUID"].setValue(data["VESSEL_GUID"]);

          fc["Service_GUID"].setValue(data["Service_GUID"]);
          fc["Billable"].setValue(data["Billable"]);

          fc["Remittance_Received_Attach"].setValue(
            data["Remittance_Received_Attach"]
          );
          fc["CTM_Ordered_Attach"].setValue(data["CTM_Ordered_Attach"]);

          fc["CTM_in_Office_Attach"].setValue(data["CTM_in_Office_Attach"]);
          fc["CTM_with_agent_Attach"].setValue(data["CTM_with_agent_Attach"]);
          fc["Vessel_Acknowledgement_Attach"].setValue(
            data["Vessel_Acknowledgement_Attach"]
          );
          fc["Amount_Remitted_Back_To_Client_Attach"].setValue(
            data["Amount_Remitted_Back_To_Client_Attach"]
          );
          fc["Cancelled_Request_Attach"].setValue(
            data["Cancelled_Request_Attach"]
          );
          fc["Transfer_To_New_Vessel_Attach"].setValue(
            data["Transfer_To_New_Vessel_Attach"]
          );
          fc["Closed_Request_Attach"].setValue(data["Closed_Request_Attach"]);
          fc["USD_Amount_Due"].setValue(data["USD_Amount_Due"]);
          fc["COMPANY_GUID"].setValue(data["COMPANY_GUID"]);
          fc["PORT_GUID"].setValue(data["PORT_GUID"]);

          fc["Remittance_Received"].setValue(
            data["Remittance_Received"]
              ? new Date(data["Remittance_Received"])
              : ""
          );
          fc["Date_Recieved"].setValue(
            data["Remittance_Received"]
              ? new Date(data["Remittance_Received"])
              : ""
          );
          fc["CTM_Ordered"].setValue(
            data["CTM_Ordered"] ? new Date(data["CTM_Ordered"]) : ""
          );
          fc["CTM_in_Office"].setValue(
            data["CTM_in_Office"] ? new Date(data["CTM_in_Office"]) : ""
          );
          fc["CTM_with_agent"].setValue(
            data["CTM_with_agent"] ? new Date(data["CTM_with_agent"]) : ""
          );
          fc["Vessel_Acknowledgement"].setValue(
            data["Vessel_Acknowledgement"]
              ? new Date(data["Vessel_Acknowledgement"])
              : ""
          );
          fc["Amount_Remitted_Back_To_Client"].setValue(
            data["Amount_Remitted_Back_To_Client"]
              ? new Date(data["Amount_Remitted_Back_To_Client"])
              : ""
          );
          fc["Cancelled_Request"].setValue(
            data["Cancelled_Request"] ? new Date(data["Cancelled_Request"]) : ""
          );
          fc["Transfer_To_New_Vessel"].setValue(
            data["Transfer_To_New_Vessel"]
              ? new Date(data["Transfer_To_New_Vessel"])
              : ""
          );
          fc["Closed_Request"].setValue(
            data["Closed_Request"] ? new Date(data["Closed_Request"]) : ""
          );

          fc["Status_GUID"].setValue(data["Status_GUID"]);
          fc["Remarks"].setValue(data["Remarks"]);
          fc["Handling_Fee"].setValue(data["Handling_Fee"]);
          fc["Amount_Recieved"].setValue(data["Amount_Recieved"]);
          fc["CTM_PIC"].setValue(data["CTM_PIC"]);
          if (
            data["Status_GUID"] ==
            "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c"
          ) {
            this.readOnly = true;
          }
          fc["Applicable_Exchange"].setValue(
            data["Applicable_Exchange"] || 1.4
          );

          fc["CTM_REF"].setValue(data["CTM_REF"]);
          if (data["denomination"] && data["denomination"].length > 0) {
            data["denomination"].map((demon) => {
              let demonData = this.dimonArray.find(
                (item) => item.PARAMETER_GUID == demon["Denomination_GUID"]
              );
              if (demonData) {
                this.ctmForm
                  .get("Quantity_" + demonData["PARAMETER_SHORT_NAME"])
                  .patchValue(demon["No_Of_Notes"]);
              }
            });
          }
          fc["Billable"].setValue(data["Billable"]);
          fc["Vendor_GUID"].setValue(data["Vendor_GUID"]);
          // this.setOrderCTMStatus();
          this.loadSelectableData(data["Planner_GUID"], data["Vendor_GUID"]);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  getStatusClicked($event) {}

  getDimonitationScale() {
    let thisVar = this;
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      this.dimonArray = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "nSVYe1nhLa82d2e80-7bee-487d-9f70-0e4a580ea7bd"
      );
      this.dimonArray.map((item) => {
        thisVar.ctmForm.addControl(
          "Quantity_" + item.PARAMETER_SHORT_NAME,
          this.fb.control(0)
        );
        thisVar.ctmForm.addControl(
          "Bill_" + item.PARAMETER_SHORT_NAME,
          this.fb.control(item.PARAMETER_SHORT_NAME)
        );
        thisVar.ctmForm.addControl(
          "Total_" + item.PARAMETER_SHORT_NAME,
          this.fb.control(0.0)
        );
        this.ctmForm
          .get("Quantity_" + item.PARAMETER_SHORT_NAME)
          .valueChanges.subscribe(function (value_100) {
            let billValue =
              thisVar.ctmForm.get("Bill_" + item.PARAMETER_SHORT_NAME).value ||
              0;
            thisVar.ctmForm
              .get("Total_" + item.PARAMETER_SHORT_NAME)
              .patchValue(value_100 * billValue);
            thisVar.calculateTotalAmount();
          });
      });
    }
  }
  calculateTotalAmount() {
    let Total_100 = this.ctmForm.get("Total_100").value || 0;
    let Total_50 = this.ctmForm.get("Total_50").value || 0;
    let Total_20 = this.ctmForm.get("Total_20").value || 0;
    let Total_10 = this.ctmForm.get("Total_10").value || 0;
    let Total_5 = this.ctmForm.get("Total_5").value || 0;
    let Total_1 = this.ctmForm.get("Total_1").value || 0;
    this.ctmForm
      .get("Total_Amount")
      .patchValue(
        parseInt(Total_100) +
          parseInt(Total_50) +
          parseInt(Total_20) +
          parseInt(Total_10) +
          parseInt(Total_5) +
          parseInt(Total_1)
      );
    let totalAmt = this.ctmForm.get("Total_Amount").value;
    let vendorHandling = this.ctmForm.get("VENDOR_HANDLING_FEE").value;
    if (totalAmt > 0 && vendorHandling) {
      this.ctmForm
        .get("Total_Due_Amt_USD")
        .patchValue(totalAmt + vendorHandling);
    }
  }

  fileDelete(type) {
    this.ctmForm.get(type).patchValue(null);
  }

  uploadFileEvt(event, type = "Remittance_Received_Attach") {
    const file: File = event.target.files[0];
    let thisVar = this;
    if (file) {
      // this.fileName = file.name;

      const formData = new FormData();

      formData.append("sampleFile", file);

      const upload$ = this.api.FormPostApi("upload", formData);
      upload$
        .then((response) => response.json())
        .then((res) => {
          if (res["Status"] == 200) {
            if (type == "Remittance_Received_Attach") {
              thisVar.ctmForm
                .get("Remittance_Received_Attach")
                .patchValue(res["data"]);
            }
            if (type == "CTM_Ordered_Attach") {
              thisVar.ctmForm.get("CTM_Ordered_Attach").patchValue(res["data"]);
            }
            if (type == "CTM_in_Office_Attach") {
              thisVar.ctmForm
                .get("CTM_in_Office_Attach")
                .patchValue(res["data"]);
            }
            if (type == "CTM_with_agent_Attach") {
              thisVar.ctmForm
                .get("CTM_with_agent_Attach")
                .patchValue(res["data"]);
            }
            if (type == "Vessel_Acknowledgement_Attach") {
              thisVar.ctmForm
                .get("Vessel_Acknowledgement_Attach")
                .patchValue(res["data"]);
            }
            if (type == "Amount_Remitted_Back_To_Client_Attach") {
              thisVar.ctmForm
                .get("Amount_Remitted_Back_To_Client_Attach")
                .patchValue(res["data"]);
            }
            if (type == "Cancelled_Request_Attach") {
              thisVar.ctmForm
                .get("Cancelled_Request_Attach")
                .patchValue(res["data"]);
            }
            if (type == "Transfer_To_New_Vessel_Attach") {
              thisVar.ctmForm
                .get("Transfer_To_New_Vessel_Attach")
                .patchValue(res["data"]);
            }
            if (type == "Closed_Request_Attach") {
              thisVar.ctmForm
                .get("Closed_Request_Attach")
                .patchValue(res["data"]);
            }
          }
        });

      // upload$.subscribe(res => {
      //   console.log(res);
      //   if(res['Status'] == 200){
      //     if(type == 'Remittance_Received_Attach'){
      //       thisVar.ctmForm.get('Remittance_Received_Attach').patchValue(res['data']);
      //     }
      //     if(type == 'CTM_in_Office_Attach'){
      //       thisVar.ctmForm.get('CTM_in_Office_Attach').patchValue(res['data']);
      //     }
      //     if(type == 'CTM_with_agent_Attach'){
      //       thisVar.ctmForm.get('CTM_with_agent_Attach').patchValue(res['data']);
      //     }
      //     if(type == 'Vessel_Acknowledgement_Attach'){
      //       thisVar.ctmForm.get('Vessel_Acknowledgement_Attach').patchValue(res['data']);
      //     }
      //     if(type == 'CTM_Ordered_Attach'){
      //       thisVar.ctmForm.get('CTM_Ordered_Attach').patchValue(res['data']);
      //     }
      //   }
      // });
    }
  }
  SaveCTMVendor() {
    this.ErrorMessage = "";
    var data: object = {};
    for (const elem in this.ctmForm.value) {
      data[elem] = this.ctmForm.value[elem];
    }

    // if (close) {
    //   data["Closed_Request"] = new Date();
    //   data["Status_GUID"] = "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c";
    //   if (
    //     data["Vessel_Acknowledgement"] === null ||
    //     data["Vessel_Acknowledgement"] === "" ||
    //     data["Vessel_Acknowledgement_Attach"] === null ||
    //     data["Vessel_Acknowledgement_Attach"] === ""
    //   ) {
    //     const attachmentRequire =
    //       data["Vessel_Acknowledgement_Attach"] === null ||
    //       data["Vessel_Acknowledgement_Attach"] === "";
    //     const dateRequired =
    //       data["Vessel_Acknowledgement"] === null ||
    //       data["Vessel_Acknowledgement"] === "";

    //     Swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text:
    //         attachmentRequire && dateRequired
    //           ? "Vessel Acknowledgement Date and Attachment is required!"
    //           : dateRequired
    //           ? "Vessel Acknowledgement Date is required!"
    //           : "Vessel Acknowledgement Attachment is required!",
    //       backdrop: false,
    //     });
    //     return;
    //   }
    //   if (data["Billable"] === null || data["Billable"] === "") {
    //     Swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text: "CTM billable amount is required",
    //       backdrop: false,
    //     });
    //   }
    // }

    data["denomination"] = [];

    this.dimonArray.map((note) => {
      let obj = {
        Denomination_GUID: note["PARAMETER_GUID"],
        No_Of_Notes: data["Quantity_" + note["PARAMETER_SHORT_NAME"]],
        Total_Amount: data["Total_" + note["PARAMETER_SHORT_NAME"]],
      };
      data["denomination"].push(obj);
    });

    if (this.IsEdit) {
      this.update(data, "support-ctm/update");
    } else {
      this.Save(data, "support-ctm/insert");
    }
  }

  update(data: object, path: string) {
    this.api.PutDataService(path, data).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Ctm log updated successfully",
            "notify-success",
            3000
          );
          window.location.reload();
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        // this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  closeCTMRecord() {
    var data: object = {};
    for (const elem in this.ctmForm.value) {
      data[elem] = this.ctmForm.value[elem];
    }
    data["Closed_Request"] = new Date();
    data["Status_GUID"] = "8DIB0IVWH30a4b68c-d66c-48ef-bfaf-fc87a3f4415c";
    if (
      data["Vessel_Acknowledgement"] === null ||
      data["Vessel_Acknowledgement"] === ""
    ) {
      const dateRequired =
        data["Vessel_Acknowledgement"] === null ||
        data["Vessel_Acknowledgement"] === "";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Vessel Acknowledgement Date is required!",
        backdrop: false,
      });
      return;
    }
    if (data["Billable"] === null || data["Billable"] === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "CTM billable amount is required",
        backdrop: false,
      });
      return;
    }
    Swal.fire({
      title: "Are you sure want to close this CTM?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Close Plan",
      backdrop: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.SaveCTMVendor();
      }
    });
  }
  Save(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        // this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Ctm Log saved successfully",
            "notify-success",
            3000
          );
          const insertedCTM = res["Data"][0]["CTM_GUID"];
          window.location.href = `${window.location.origin}/support-ctm/edit/${insertedCTM}`;
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        // this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
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

  sendEmail(usd = true) {
    const dialogRef = this.dialog.open(EmailToVendorComponent, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });
    const finalString = this.formatEmailHtml(
      usd ? this.stringHtml : this.stringSgdHtml,
      false,
      usd ? "USD" : "SGD"
    );
    const emails = [];
    if (
      this.selectedVendor["EMAIL_ID1"] &&
      "" !== this.selectedVendor["EMAIL_ID1"]
    ) {
      emails.push(this.selectedVendor["EMAIL_ID1"]);
    }
    if (
      this.selectedVendor["EMAIL_ID2"] &&
      "" !== this.selectedVendor["EMAIL_ID2"]
    ) {
      emails.push(this.selectedVendor["EMAIL_ID2"]);
    }
    const table = `<table role="presentation" border="1" cellspacing="1" cellspadding="5" width="300px"><tr style="background:#ccc"><th>USD Bill</th><th>Nos</th><th>Total</th></tr>
        ${this.dimonArray
          .map(
            (dimon, index) => `<tr>
        <td style="text-align:center;width:80px">${
          this.ctmForm.get("Bill_" + dimon.PARAMETER_SHORT_NAME).value
        }</td>
        <td style="text-align:center;width:80px">${
          this.ctmForm.get("Quantity_" + dimon.PARAMETER_SHORT_NAME).value
        }</td>
        <td style="text-align:right;width:140px"> ${this.numberWithCommas(
          this.ctmForm.get("Total_" + dimon.PARAMETER_SHORT_NAME).value
        )} </td>
      </tr>`
          )
          .join("")}</table>`;
    dialogRef.componentInstance.stringHtml = finalString;
    dialogRef.componentInstance.replaceTable = table;
    dialogRef.componentInstance.vendorEmails = emails.join(";");
    dialogRef.componentInstance.subjectLine = `${this.selectedPlannerDetails.VESSEL_NAME} : CTM Requirement`;

    dialogRef.afterClosed().subscribe((data: any) => {});
  }

  loadSelectableData(planner_id = null, vendorId = null) {
    const payload = {
      module: ["service_vendors", "planner", "users"],
      plan_status: planner_id
        ? null
        : "ZVqQ6nM4ddd3c03b6-78ec-4c4c-8e98-f22ff5c09b0a",
      planner_id: planner_id,
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      if (res["Status"] === 200) {
        this.CtmVendorList = res["Data"].service_vendors;
        this.filtered_ctm_vendors.next(
          this.CtmVendorList.filter(
            (item) =>
              item["SERVICE_GUID"] ===
              "vcryU7qKZ540c23dc-04ea-4e04-b18e-49600e155e99"
          )
        );

        let vendorData = this.CtmVendorList.find(
          (item) => item["Vendor_GUID"] == vendorId
        );

        if (vendorId) {
          this.selectedVendor = vendorData;
          if (vendorData) {
            let totalAmt = this.ctmForm.get("Total_Amount").value;
            if (totalAmt >= 0) {
              const handling_fee = vendorData["Handling_Fee"]
                ? vendorData["Handling_Fee"]
                : 0;
              let vendorHandlingFee =
                (parseFloat(handling_fee) * totalAmt) / 100;
              this.ctmForm
                .get("VENDOR_HANDLING_FEE")
                .patchValue(vendorHandlingFee);
              this.ctmForm
                .get("Vendor_Name")
                .patchValue(vendorData["Vendor_Name"]);
              this.ctmForm
                .get("Total_Due_Amt_USD")
                .patchValue(totalAmt + vendorHandlingFee);
            }
          }
        }

        if (planner_id) {
          this.selectedPlannerDetails = res["Data"].planner[0];
        }
        this.PlannerList = res["Data"].planner;
        this.filtered_planner.next(this.PlannerList);
        this.ctmForm.controls["Planner_Filter"].valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe((val) => {
            this.onFilterChange(
              val,
              "REF_NUM",
              this.PlannerList,
              this.filtered_planner
            );
          });
        this.PicList = res["Data"].users;
        this.filtered_ctm_pic.next(this.PicList);
      }
    });
  }
  getAllErrors(form: FormGroup | FormArray): { [key: string]: any } | null {
    let hasError = false;
    const result = Object.keys(form.controls).reduce((acc, key) => {
      const control = form.get(key);
      const errors =
        control instanceof FormGroup || control instanceof FormArray
          ? this.getAllErrors(control)
          : control.errors;
      if (errors) {
        acc[key] = errors;
        hasError = true;
      }
      return acc;
    }, {} as { [key: string]: any });
    return hasError ? result : null;
  }
}
