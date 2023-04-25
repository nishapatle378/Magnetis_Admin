import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

@Component({
  selector: "fury-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  animations: [fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  forgot_form: FormGroup;

  inputType = "password";
  visible = false;
  subscription: Subscription;
  isForgotPassword: Boolean = false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    public api: ApiService,
    private common: CommonService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
    });
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    // this.subscription.unsubscribe();
  }

  ShowMessage(msg: string) {
    this.snackbar.open(msg, "", {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
  toggleForgotPassword() {
    if (this.isForgotPassword) {
      this.form.controls["password"].setValidators([Validators.required]);
    } else {
      this.form.controls["password"].clearValidators();
    }
    this.form.controls["password"].setValue("");
    this.form.controls["password"].updateValueAndValidity();
    this.isForgotPassword = !this.isForgotPassword;
  }
  send(data: object) {
    if (!data["email"]) {
      this.ShowMessage("Login Id can not be empty");
    } else if (!data["password"]) {
      this.ShowMessage("Password can not be empty");
    } else {
      // data['loginId'] = data['email'];
      // this.router.navigate(['dashboard']);
      var post_data = {
        LOGIN_ID: data["email"],
        PASSWORD: data["password"],
      };
      this.api.PostDataService("user/login", post_data).subscribe(
        (res: any) => {
          console.log(res, "res")
          if (res["Status"] === 200) {
            let thisVar = this;
            localStorage.setItem(
              "AdminData",
              JSON.stringify({
                user_data: res["Data"],
              })
            );
            thisVar.getSystemParams(res["Data"]);
          } else {
            this.common.ShowMessage(res.Message, "notify-error", 4000);
          }
        },
        (error) => {
          this.common.ShowMessage("Login Failed", "notify-error", 4000);
        }
      );
    }
  }
  sendEmail(data: object) {
    if (!data["email"]) {
      this.ShowMessage("Login Id can not be empty");
    } else {
      var post_data = {
        EMAIL: data["email"],
      };
      this.api
        .PostDataService("generate/password-reset-token", post_data)
        .subscribe(
          (res: any) => {
            if (res["Status"] === 200) {
              this.common.ShowMessage(
                "Password reset tokens sent on your registered email.",
                "notify-success",
                4000
              );
            } else {
              this.common.ShowMessage(res.Message, "notify-error", 4000);
            }
          },
          (error) => {
            this.common.ShowMessage("Login Failed", "notify-error", 4000);
          }
        );
    }
  }

  getSystemParams(user) {
    this.api.GetDataService("sp/all").subscribe(
      (res: any) => {
        if (res["Status"] === 200) {
          const sysparam = res["Data"]
            .filter((item) => 1 === item["ACTIVE_STATUS"])
            .map((item) => ({
              PARAMETER_GUID: item.PARAMETER_GUID,
              PARAMETER_NAME: item.PARAMETER_NAME,
              PARAMETER_SHORT_NAME: item.PARAMETER_SHORT_NAME,
              PARENT_GUID: item.PARENT_GUID,
              SORT_ORDER: item.SORT_ORDER,
            }));
          localStorage.setItem("systemParamsData", JSON.stringify(sysparam));
          if (user["Landing_Page"] === "dashboard") {
            this.router.navigate(["/dashboard"]);
          } else {
            this.router.navigate(["/planner/add-service"]);
          }
        } else {
          this.common.ShowMessage(res.Message, "notify-error", 4000);
        }
      },
      (error) => {
        this.common.ShowMessage("Login Failed", "notify-error", 4000);
      }
    );
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = "password";
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = "text";
      this.visible = true;
      this.cd.markForCheck();
    }
  }
}
