import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomValidator } from "src/app/custom.validator";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

@Component({
  selector: "fury-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
  animations: [fadeInUpAnimation],
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  token = null;
  inputType = "password";
  visible = false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    public api: ApiService,
    private common: CommonService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = this.route.snapshot.paramMap.get("token");
    });
    this.form = this.fb.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            CustomValidator.cannotContainSpace,
          ],
        ],
        confirm_password: [
          "",
          [Validators.required, CustomValidator.cannotContainSpace],
        ],
      },
      {
        validator: CustomValidator.ConfirmedValidator(
          "password",
          "confirm_password"
        ),
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
  ShowMessage(msg: string) {
    this.snackbar.open(msg, "", {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
  send(data: object) {
    if (!data["password"]) {
      this.common.ShowMessage("Password cannot be empty", "notify-error", 4000);
    } else if (data["password"] !== data["confirm_password"]) {
      this.common.ShowMessage(
        "Confirm Password did not matched",
        "notify-error",
        4000
      );
    } else {
      var post_data = {
        PASSWORD_RESET_TOKEN: this.token,
        PASSWORD: data["password"],
      };
      this.api.PostDataService("reset/password", post_data).subscribe(
        (res: any) => {
          if (res["Status"] === 200) {
            this.common.ShowMessage(
              "Password successfully saved",
              "notify-success",
              4000
            );
            this.router.navigate(["/login"]);
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
}
