import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Observable, Subject, ReplaySubject } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "fury-smtp-setting",
  templateUrl: "./smtp-setting.component.html",
  styleUrls: ["./smtp-setting.component.scss"],
})
export class SmtpSettingComponent implements OnInit {
  firstFormGroup: FormGroup;
  protected _onDestroy = new Subject<void>();
  ErrorMessage = null;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SmtpSettingComponent>,
    private api: ApiService,
    private common: CommonService
  ) {}
  submit = false;
  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      USER_GUID: [""],
      Smtp_Host: ["", Validators.required],
      Smtp_Port: ["", Validators.required],
      Smtp_Username: ["", Validators.required],
      Smtp_Password: ["", Validators.required],
      Smtp_Secure: ["1", Validators.required],
      MODIFIED_BY: ["ADMIN"],
    });
    console.log(this.firstFormGroup);
    this.getSMTPdetails()
  }

  insertIntoForm(userInfo) {
    if (userInfo) {
      this.firstFormGroup.get("USER_GUID").patchValue(userInfo["USER_GUID"]);
      this.firstFormGroup.get("Smtp_Host").patchValue(userInfo["Smtp_Host"]);
      this.firstFormGroup.get("Smtp_Port").patchValue(userInfo["Smtp_Port"]);
      this.firstFormGroup
        .get("Smtp_Username")
        .patchValue(userInfo["Smtp_Username"]);
      this.firstFormGroup
        .get("Smtp_Password")
        .patchValue(userInfo["Smtp_Password"]);
      this.firstFormGroup
        .get("Smtp_Secure")
        .patchValue(userInfo["Smtp_Secure"]);
    }
  }

  closeModel() {
    this.dialogRef.close(null);
  }

  saveConfiguration() {
    this.ErrorMessage = "";
    if (this.submit) {
      return;
    }
    this.submit = true;
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    this.submit = false;
    this.SaveSetting(data, "user/smtp");
  }
  getSMTPdetails() {
    this.api.GetDataService("user/get").subscribe(
      (res: object) => {
        this.submit = false;
        console.log(res);
        if (res["Status"] === 200) {
          console.log("SMTP user",res["Data"])
          this.insertIntoForm(res["Data"]);
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  SaveSetting(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        console.log(res);
        if (res["Status"] === 200) {
          let userInfoObj = JSON.parse(localStorage.getItem("AdminData"));
          if (userInfoObj) {
            userInfoObj["user_data"]["is_Smtp_Enabled"] = true;
            localStorage.setItem("AdminData", JSON.stringify(userInfoObj));
          }
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "SMTP setting saved successfully",
            "notify-success",
            3000
          );
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage('Invalid SMTP credential', "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
}
