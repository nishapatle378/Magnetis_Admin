import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { Observable, Subject, ReplaySubject } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import * as _moment from "moment";
import { MatDialogRef } from "@angular/material/dialog";
import { CustomValidator } from "src/app/custom.validator";
@Component({
  selector: "fury-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  firstFormGroup: FormGroup;
  protected _onDestroy = new Subject<void>();
  ErrorMessage = null;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private common: CommonService,
    private dialogRef: MatDialogRef<ChangePasswordComponent>
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group(
      {
        OLD_PASSWORD: ["", Validators.required],
        NEW_PASSWORD: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            CustomValidator.cannotContainSpace,
          ],
        ],
        CONFIRM_PASSWORD: [
          "",
          [Validators.required, CustomValidator.cannotContainSpace],
        ],
      },
      {
        validator: CustomValidator.ConfirmedValidator(
          "NEW_PASSWORD",
          "CONFIRM_PASSWORD"
        ),
      }
    );

  }

  closeModel() {
    this.dialogRef.close(null);
  }
  comparePassword(password, confirmPassword) {
    if(password.length > 0 && confirmPassword.length > 0 && password!=confirmPassword){
      this.ErrorMessage = 'Confirm Password did not matched'
      return true;
    }else{
      this.ErrorMessage = null
      return false;
    }
  }
  saveServiceData(data: object) {
    this.api.PostDataService("user/update-password", data).subscribe(
      (res: object) => {
        console.log(res);
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "User saved successfully",
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
  }
}
