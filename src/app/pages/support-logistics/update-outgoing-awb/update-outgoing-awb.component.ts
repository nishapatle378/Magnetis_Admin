import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { Subject, ReplaySubject } from "rxjs";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { takeUntil } from "rxjs/operators";
import Swal from "sweetalert2";
import * as moment from "moment";

@Component({
  selector: "fury-update-outgoing-awb",
  templateUrl: "./update-outgoing-awb.component.html",
  styleUrls: ["./update-outgoing-awb.component.scss"],
})
export class UpdateOutgoingAwbComponent implements OnInit {
  logisticsForm: FormGroup;
  logisticIds: Array<string> = [];
  selectedLogisticData: Array<object> = [];

  CourierList: Array<object> = [];
  CurrencyList: Array<object> = [];

  public filtered_currency: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_courier: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);

  constructor(
    private dialogRef: MatDialogRef<UpdateOutgoingAwbComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.logisticsForm = this.fb.group({
      Logistics_GUID: [""],
      Outgoing_Courier: [""],
      Outgoing_AWB: [""],
      Outgoing_Attachment: [""],
      Currency: ["SWwa1qAFwf6a6c6f3-7b8c-4b32-8ad2-dfc1085f493a"],
      Date_Of_Dispatch: [],
      Outgoing_Remark: [""],
      Billable: [],
      Amount: [0],
      out_courier_Filter: [""],
    });
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    this.getSysTemParameter(sysData);
    this.loadSelectableData();
    this.logisticsForm
      .get("out_courier_Filter")
      .valueChanges.subscribe((search) => {
        this.onFilterChange(
          search,
          "PARAMETER_NAME",
          this.CourierList,
          this.filtered_courier
        );
      });
      
  }
  getSysTemParameter(sysData) {
    if (sysData) {
      //Courier List
      this.CourierList = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "vsar359bN936ec994-0683-4894-bdd7-04bbf17abe19"
      );
      this.filtered_courier.next(this.CourierList);
    }
  }
  loadSelectableData() {
    //PostDataService
    const payload = {
      module: ["currency"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] == 200) {
          this.CurrencyList = res["Data"].currency;
          this.filtered_currency.next(this.CurrencyList);
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
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
  fileDelete() {
    this.logisticsForm.get("Outgoing_Attachment").setValue("");
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
            thisVar.logisticsForm
              .get("Outgoing_Attachment")
              .patchValue(res["data"]);
          }
        });
    }
  }
  SaveLogistics(data: object) {
    const emptyList = this.selectedLogisticData.filter((_item) => {
      if (
        _item["Outgoing_AWB"] === "" ||
        _item["Outgoing_Courier"] ||
        _item["Outgoing_Attachment"] ||
        _item["Currency"] ||
        _item["Date_Of_Dispatch"] ||
        _item["Outgoing_Remark"] ||
        _item["Billable"] ||
        _item["Amount"]
      ) {
        return true;
      } else {
        return false;
      }
    });
    if (emptyList.length) {
      Swal.fire({
        title: "",
        text: "We have found existing data in OUTGOING AWB, for one or multiple records",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Overwrite All",
        denyButtonText: "Update only blank records",
        backdrop: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateLogistic(data, false);
        } else if (result.isDenied) {
          this.updateLogistic(data, true);
        }
      });
    } else {
      this.updateLogistic(data, false);
    }
  }
  updateLogistic(formData, blankOnly) {
  
    const user = JSON.parse(localStorage.getItem('AdminData'))
    const logistics = [];
    this.selectedLogisticData.map(_item => {
      const logUpdate = {};
      logUpdate["Logistics_GUID"] = _item["Logistics_GUID"];
      logUpdate["Outgoing_Courier"] =
        !blankOnly || _item["Outgoing_Courier"] === "" || _item["Outgoing_Courier"] === null
          ? formData["Outgoing_Courier"]
          : _item["Outgoing_Courier"];
      logUpdate["Outgoing_AWB"] =
        !blankOnly || _item["Outgoing_AWB"] === "" || _item["Outgoing_AWB"] === null
          ? formData["Outgoing_AWB"]
          : _item["Outgoing_AWB"];
      logUpdate["Outgoing_Attachment"] =
        !blankOnly || _item["Outgoing_Attachment"] === "" || _item["Outgoing_Attachment"] === null
          ? formData["Outgoing_Attachment"]
          : _item["Outgoing_Attachment"];
      logUpdate["Currency"] =
        !blankOnly || _item["Currency"] === "" || _item["Currency"] === null
          ? formData["Currency"]
          : _item["Currency"];
      logUpdate["Date_Of_Dispatch"] =
        !blankOnly || _item["Date_Of_Dispatch"] === "" || _item["Date_Of_Dispatch"] === null
          ? formData["Date_Of_Dispatch"]
          : _item["Date_Of_Dispatch"];
          if(formData["Outgoing_Remark"]){
            logUpdate["Outgoing_Remark"] = `${_item["Outgoing_Remark"]}
            [${user['user_data']['USER_FIRST_NAME']}] [${moment().format('DDMMMYY HH:mm')}] ${formData["Outgoing_Remark"]}
            `
          }
      // logUpdate["Outgoing_Remark"] =
      //   !blankOnly || _item["Outgoing_Remark"] === "" || _item["Outgoing_Remark"] === null
      //     ? formData["Outgoing_Remark"]
      //     : _item["Outgoing_Remark"];
      logUpdate["Billable"] =
        !blankOnly || _item["Billable"] === "" || _item["Billable"] === null
          ? formData["Billable"]
          : _item["Billable"];
      logUpdate["Amount"] =
        !blankOnly || _item["Amount"] === "" || _item["Amount"] === null
          ? formData["Amount"]
          : _item["Amount"];
      logistics.push(logUpdate);
    });
    const payload = {
      logistics: logistics,
    };
    this.api.PostDataService("/logistics/update-awb", payload).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          this.logisticsForm.reset();
          this.common.ShowMessage(
            "Logistics updated successfully",
            "notify-success",
            3000
          );
          this.dialogRef.close(true);
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  CloseModal() {
    this.dialogRef.close(false);
  }
}
