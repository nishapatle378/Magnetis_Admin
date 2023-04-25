import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "src/app/providers/services/ApiService";
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
  selector: "fury-update-delivery",
  templateUrl: "./update-delivery.component.html",
  styleUrls: ["./update-delivery.component.scss"],
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
export class UpdateDeliveryComponent implements OnInit {
  deliveryForm: FormGroup;
  logisticIds: Array<string> = [];
  selectedLogisticData: Array<object> = [];
  deliveryRef: string = "";
  isOverwriteData = false;
  onlyDeliveryData = false;
  constructor(
    private dialogRef: MatDialogRef<UpdateDeliveryComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    if(this.onlyDeliveryData){
      this.deliveryForm = this.fb.group({
        DeliveryRef: ["", Validators.required],
        Delivery_Date: [new Date(), Validators.required],
      });
      this.generateRefNumber('SWS/D');
    }else{
      this.deliveryForm = this.fb.group({
        Remarks: [""],
        DeliveryRef: ["", Validators.required],
        Acknowledgment: [""],
        Delivery_Date: [new Date(), Validators.required],
      });
      this.generateRefNumber('SWS/D');
    }
  
  
    const emptyList = this.selectedLogisticData.filter((_item) => {
      if (
        _item["DeliveryRef"] === "" ||
        _item["Remarks"] ||
        _item["Acknowledgment"] ||
        _item["Delivery_Date"]
      ) {
        return true;
      } else {
        return false;
      }
    });
    if (emptyList.length) {
      this.isOverwriteData = true;
    }
  }
  generateRefNumber(prefix = '') {
    this.api.GetDataService("common/get-delivery-ref").subscribe((res) => {
      if (res["Status"] == 200) {
        this.deliveryRef = `${prefix}${res["Data"].ref_number}`;
        this.deliveryForm.get("DeliveryRef").patchValue(this.deliveryRef );
      }
    });
  }
  UpdateDelivery(formData, blankOnly) {
    const logistics = [];
    const user = JSON.parse(localStorage.getItem('AdminData'))
    this.selectedLogisticData.map(_item => {
      const logUpdate = {};
 
      logUpdate["Logistics_GUID"] = _item["Logistics_GUID"];
      logUpdate["Billable"] = _item["Billable"];
   
          logUpdate["Delivery_Date"] =
        (!blankOnly || (_item["Delivery_Date"] === "" || _item["Delivery_Date"] === null))
          ? formData["Delivery_Date"]
          : _item["Delivery_Date"];

          logUpdate["DeliveryRef"] =
          !blankOnly || _item["DeliveryRef"] === "" || _item["DeliveryRef"] === null
            ? formData["DeliveryRef"]
            : _item["DeliveryRef"];
          if(!this.onlyDeliveryData){
            
          logUpdate["Acknowledgment"] =
            !blankOnly || _item["Acknowledgment"] === "" || _item["Acknowledgment"] === null
              ? formData["Acknowledgment"]
              : _item["Acknowledgment"];
              if(formData["Remarks"]){
                logUpdate["Remarks"] = `${_item["Remarks"] ? _item["Remarks"] : ''}
                [${user['user_data']['USER_FIRST_NAME']}] [${moment().format('DDMMMYY HH:mm')}] ${formData["Remarks"]}
                `
              }
          }
          logistics.push(logUpdate)
    });
    const payload = {
      logistics: logistics,
      onlyDeliveryData:this.onlyDeliveryData
    };

    this.api
      .PostDataService("logistic/update-delivery", payload)
      .subscribe((res: object) => {
        if(res['Status'] == 200){
          this.dialogRef.close({refNumber:`SWS/D${res['refNumber']}` , Delivery_Date : this.deliveryForm.get("Delivery_Date").value});
        }
      });
  }
  getFileURL(fileName) {
    return `${this.api.API_HOST}${fileName}`;
  }
  CloseModal() {
    this.dialogRef.close( false);
  }

  fileDelete() {
    this.deliveryForm.get("Acknowledgment").setValue("");
  }
  uploadFileEvt(event) {
    const file: File = event.target.files[0];
    let thisVar = this;
    if (file) {
      const formData = new FormData();
      formData.append("sampleFile", file);
      const upload$ = this.api.FormPostApi("/upload", formData);
      upload$
        .then((response) => response.json())
        .then((res) => {
          if (res["Status"] == 200) {
            thisVar.deliveryForm.get("Acknowledgment").patchValue(res["data"]);
          }
        });
    }
  }
}
