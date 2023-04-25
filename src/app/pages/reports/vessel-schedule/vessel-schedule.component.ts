import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";

import { ReplaySubject, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { fadeInRightAnimation } from "src/@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "src/@fury/animations/fade-in-up.animation";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { EmailToVendorComponent } from "../../support-ctm/email-to-vendor/email-to-vendor.component";
import * as moment from "moment";

export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY-MM-DD",
  },
  display: {
    dateInput: "DD MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM-YYYY",
  },
};

@Component({
  selector: "fury-vessel-schedule",
  templateUrl: "./vessel-schedule.component.html",
  styleUrls: ["./vessel-schedule.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class VesselScheduleComponent implements OnInit {
  authGuard: AuthGuard;
  @ViewChild("TABLE1") table1: ElementRef;

  columns: ListColumn[] = [
    { property: "COMPANY_NAME", visible: true, name: "Company Name" },
    { property: "VESSEL_NAME", visible: true, name: "Vessel Name" },
    { property: "VESSEL_TYPE", visible: true, name: "Vessel Type" },
    {
      property: "VESSEL_ACTUAL_ARR",
      visible: true,
      name: "Vessel Actual Arrival",
    },
    { property: "PLANNER_PIC", visible: true, name: "PIC" },
  ] as ListColumn[];
  filterFormGroup: any;
  dataSourceDetail: any;
  company_list: any;
  loading = false;
  UserList: Array<object> = [];
  ScheduleDta: Array<object> = [];
  stringHtml = `<p>Dear All,</p><p>Kindly find below, the current schedule as of {{todayDate}}, for records between {{fromDate}} and {{toDate}}</p>{{scheduleTable}}`;

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_users: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  protected _onDestroy = new Subject<void>();

  constructor(
    private api: ApiService,
    private common: CommonService,
    private titleService: Title,
    private auth: AuthGuard,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Historical Activity Report`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit(): void {
    this.filterFormGroup = this.fb.group({
      PRINCIPAL_GUID: [""],
      AGENT_GUID: [""],
      VESSEL_ETA_FROM: [""],
      VESSEL_ETD_TO: [""],
      principal_Filter: [""],
      agent_Filter: [""],
    });
    this.dataSourceDetail = new MatTableDataSource();
    this.FetchAllCompany();
    this.filterFormGroup.controls["principal_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.principal_filter_List(val);
      });
    this.filterFormGroup.controls["agent_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterPicChange(val, this.UserList, this.filtered_users);
      });
  }
  onClickSubmit(filter) {
    const url = `planner/schedule?company=${
      filter["PRINCIPAL_GUID"] || ""
    }&fromDate=${filter["VESSEL_ETA_FROM"] || ""}&toDate=${
      filter["VESSEL_ETD_TO"] || ""
    }&agent=${filter["AGENT_GUID"] || ""}`;
    this.FetchAllPlanner(url);
  }
  clearFilter() {
    this.filterFormGroup.reset();
    this.FetchAllPlanner();
  }

  protected principal_filter_List(val: any) {
    if (!this.company_list) {
      return;
    }
    // get the search keyword
    let search = val;
    if (!search) {
      this.filtered_principal.next(this.company_list);
      return;
    } else {
      search = search.toLowerCase();
    }
    var filter = this.company_list.filter(
      (s) => s["COMPANY_NAME"].toLowerCase().indexOf(search) > -1
    );
    this.filtered_principal.next(filter);
  }
  protected onFilterPicChange(
    search: any,
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
      (s) =>
        `${s["USER_FIRST_NAME"]} ${s["USER_MIDDLE_NAME"]} ${s["USER_LAST_NAME"]}`
          .toLowerCase()
          .indexOf(search) > -1
    );
    fiteredList.next(filter);
  }
  FetchAllCompany() {
    const payload = {
      module: ["company", "users"],
    };
    this.api.PostDataService("bulk/get", payload).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.company_list = res["Data"].company.filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.UserList = res["Data"].users;
          this.filtered_users.next(this.UserList);
          this.filtered_principal.next(this.company_list);
          this.FetchAllPlanner();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  FetchAllPlanner(url = "planner/schedule") {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.ScheduleDta = res["Data"];
          this.dataSourceDetail.data = res["Data"];
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
  sendEmail() {
    const dialogRef = this.dialog.open(EmailToVendorComponent, {
      width: "50%",
      maxHeight: "100%",
      disableClose: true,
    });
    let finalString = this.formatEmailHtml(this.stringHtml);

    const table = `<table role="presentation" border="1" cellspacing="1" cellspadding="5" width="600px">
    <tr style="background:#ccc"><th>Company Name</th><th>Vessel Name</th><th>Vessel Type</th><th>Vessel Actual Arrival</th><th>PIC</th></tr>
        ${this.ScheduleDta.map(
          (schedule, index) => `<tr>
        <td style="text-align:center;width:80px">${
          schedule["COMPANY_NAME"] || ""
        }</td>
        <td style="text-align:center;width:80px">${
          schedule["VESSEL_NAME"] || ""
        }</td>
        <td style="text-align:right;width:140px">${
          schedule["VESSEL_TYPE_NAME"] || ""
        }</td>
        <td style="text-align:right;width:140px">${
          moment(schedule["VESSEL_ACTUAL_ARR"]).format("DD MMM YYYY HH:mm") ||
          ""
        }</td>
        <td style="text-align:right;width:140px">${
          schedule["PIC_NAME"] || ""
        }</td>
      </tr>`
        ).join("")}</table>`;
    const ptable = `<p>Company Name  | Vessel Name | Vessel Type | Vessel Actual Arrival | PIC</p><br />${this.ScheduleDta.map(
      (schedule, index) => `
            ${schedule["COMPANY_NAME"] || ""} | ${
        schedule["VESSEL_NAME"] || ""
      } | ${schedule["VESSEL_TYPE_NAME"] || ""} | ${
        moment(schedule["VESSEL_ACTUAL_ARR"]).format("DD MMM YYYY HH:mm") || ""
      } | ${schedule["PIC_NAME"] || ""}`
    ).join("<br />")}`;
    
    finalString = finalString.replace("{{scheduleTable}}", `{${ptable}}`);
    dialogRef.componentInstance.stringHtml = finalString;
    dialogRef.componentInstance.replaceTable = table;
    dialogRef.componentInstance.vendorEmails = "";
    dialogRef.componentInstance.subjectLine = `Vessel Schedule Report`;

    dialogRef.afterClosed().subscribe((data: any) => {});
  }

  formatEmailHtml(string) {
    let formData = this.filterFormGroup.value;
    string = string.replace(
      "{{todayDate}}",
      moment().format("DD MMM YYYY HH:mm")
    );
    if (formData.VESSEL_ETA_FROM) {
      string = string.replace(
        "{{fromDate}}",
        moment(formData.VESSEL_ETA_FROM).format("DD MMM YYYY HH:mm")
      );
    } else {
      string = string.replace("{{fromDate}}", "");
    }
    if (formData.VESSEL_ETA_TO) {
      string = string.replace(
        "{{toDate}}",
        moment(formData.VESSEL_ETA_TO).format("DD MMM YYYY HH:mm")
      );
    } else {
      string = string.replace("{{toDate}}", "");
    }

    return string;
  }
}
