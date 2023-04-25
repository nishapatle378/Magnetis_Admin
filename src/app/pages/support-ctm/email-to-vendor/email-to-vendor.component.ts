import { Component, ElementRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Subject } from "rxjs";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { MatDialogRef } from "@angular/material/dialog";
import { EditorChangeContent, EditorChangeSelection } from "ngx-quill";

// import { Editor } from 'ngx-editor';
// import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: "fury-email-to-vendor",
  templateUrl: "./email-to-vendor.component.html",
  styleUrls: ["./email-to-vendor.component.scss"],
})
export class EmailToVendorComponent implements OnInit {
  html: "";
  replaceTable: string = null;
  name = "Angular 6";
  htmlContent = "";
  subjectLine: string = "CTM Requirement";
  firstFormGroup: FormGroup;
  vendorEmails: string = "";
  protected _onDestroy = new Subject<void>();
  ErrorMessage = null;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmailToVendorComponent>,
    private api: ApiService,
    private common: CommonService
  ) {}
  submit = false;
  text1 = "";

  stringHtml: string = null;
  ngOnInit(): void {
    // this.editor = new Editor();

    this.firstFormGroup = this.fb.group({
      USER_GUID: [""],
      mail_to: [this.vendorEmails, Validators.required],
      subject: [this.subjectLine, Validators.required],
    });
  }
  ngOnDestroy(): void {
    // this.editor.destroy();
  }

  closeModel() {
    this.dialogRef.close(null);
  }

  created(event: any) {
    console.log(event);

    if (this.stringHtml != null) {
      event.root.innerHTML = this.stringHtml;
    }
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {}

  contentChanged(obj: any) {
    this.stringHtml = obj.html;
  }
  sendEmailToVendor() {
    let userData = localStorage.getItem("AdminData");
    if (userData) {
      let user = JSON.parse(userData).user_data;
      if (user) {
        this.firstFormGroup.get("USER_GUID").patchValue(user["USER_GUID"]);
      }
    }
    this.ErrorMessage = "";
    var data: object = {};
    for (const elem in this.firstFormGroup.value) {
      data[elem] = this.firstFormGroup.value[elem];
    }
    const body = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width">
    <title></title>
    <style type="text/css">
      table td {border-collapse: collapse;}
    </style>
    </head><body>${this.stringHtml.replace(
      /\{[^\}]+\}/g,
      this.replaceTable
    )}</body></html>`;
    data["mail_body"] = body;
    this.sendEmail(data, "send-email");
  }

  sendEmail(data: object, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.common.ShowMessage(
            "Email sent successfully",
            "notify-success",
            3000
          );
          this.firstFormGroup.reset();
          this.dialogRef.close(true);
        } else {
          this.ErrorMessage = res["message"];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.submit = false;
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
}
