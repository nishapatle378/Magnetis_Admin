import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

@Component({
  selector: "fury-update-service-status",
  templateUrl: "./update-service-status.component.html",
  styleUrls: ["./update-service-status.component.scss"],
})
export class UpdateServiceStatusComponent implements OnInit {
  services: Array<object> = [];
  planner:string = null;
  servicesForm: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<UpdateServiceStatusComponent>,
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit(): void {
    this.servicesForm = this.fb.group({});
    this.services.map((_item, index) => {
      this.servicesForm.addControl(
        "Services_Type_GUID_" + index,
        this.fb.control(_item["PARAMETER_GUID"])
      );
      this.servicesForm.addControl("Status_GUID_" + index, this.fb.control(1));
    });
  }
  radiobuttonClick(value, index) {
    console.log(`Status_GUID_${index}`);
    this.servicesForm.get(`Status_GUID_${index}`).patchValue(value);
  }
  SaveServices(data: object) {
    console.log(data);
    const services = [];
    this.services.map((_item, index)=>{
      const isClosed = this.servicesForm.get(`Status_GUID_${index}`).value;
      if(isClosed == 1){
        services.push(this.servicesForm.get(`Services_Type_GUID_${index}`).value)
      }
    })
    const payload = {
      plannerId: this.planner,
      services:services
    };
    this.api.PostDataService("planner/close", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.common.ShowMessage(res["Message"], "notify-success", 6000);
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
