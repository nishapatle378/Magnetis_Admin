import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject } from "rxjs";
import { filter } from "rxjs/operators";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditUsersComponent } from "../add-edit-users/add-edit-users.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";

import { AssignPriority } from "../../../common-component/assign-priority/assign-priority.component";
import { AssignCustomerType } from "../../../common-component/assign-customer-type/assign-customer-type.component";
import { AssignServices } from "../../../common-component/assign-services/assign-services.component";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-users",
  templateUrl: "./view-all-users.component.html",
  styleUrls: ["./view-all-users.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllUsersComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  FilterDataStatusValue = "Activated";
  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    // { property: 'srn', visible: true, name: 'Sr No' },
    { property: "user_name", visible: true, name: "User Name" },
    { property: "PHONE_NUMBER", visible: true, name: "Phone Number" },
    { property: "EMAIL_ID", visible: true, name: "Email" },
    { property: "USER_DESIGNATION", visible: true, name: "Designation" },
    { property: "DOB", visible: true, name: "DOB" },
    { property: "PRESENT_ADDRESS", visible: true, name: "Address" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`User list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.FetchAllUser();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  exportAsExcel() {
    let ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    console.log(ws);
    ws["!cols"] = [];
    ws["!cols"][6] = { hidden: true };
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Users.xlsx");
  }

  FilterDataStatus(type: string) {
    this.FilterDataStatusValue = type;
    var data = JSON.parse(JSON.stringify(this.AllData));
    if (type == "Activated") {
      this.dataSource.data = data.filter((u: object) => u["ACTIVE_STATUS"]);
    } else if (type == "Deleted") {
      this.dataSource.data = data.filter((u: object) => !u["ACTIVE_STATUS"]);
    } else {
      this.dataSource.data = data;
    }
  }
  FilterDataStatusList() {
    var data = JSON.parse(JSON.stringify(this.AllData));
    if (this.FilterDataStatusValue == "Activated") {
      this.dataSource.data = data.filter((u: object) => u["ACTIVE_STATUS"]);
    } else if (this.FilterDataStatusValue == "Deleted") {
      this.dataSource.data = data.filter((u: object) => !u["ACTIVE_STATUS"]);
    } else {
      this.dataSource.data = data;
    }
  }

  FetchAllUser() {
    this.api.GetDataService("user/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          res["Data"].forEach((d: any) => {
            d["user_name"] =
              d.USER_FIRST_NAME +
              " " +
              (d.USER_LAST_NAME ? d.USER_LAST_NAME : "");
          });
          if (this.FilterDataStatusValue == "Activated") {
            this.dataSource.data = res["Data"].filter(
              (u: object) => u["ACTIVE_STATUS"]
            );
          } else if (this.FilterDataStatusValue == "Deleted") {
            this.dataSource.data = res["Data"].filter(
              (u: object) => !u["ACTIVE_STATUS"]
            );
          } else {
            this.dataSource.data = res["Data"];
          }
          this.AllData = res["Data"];
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  SaveUser(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditUsersComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.UserData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.FetchAllUser();
      }
    });
  }

  OpenModificationInfo(data: object) {
    const dialogRef = this.dialog.open(ModificationInfoComponent, {
      disableClose: true,
      width: "30%",
    });
    dialogRef.componentInstance.UserData = data;

    dialogRef.afterClosed().subscribe((data: any) => {});
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  ngOnDestroy() {}

  ChangeStatus(data: object) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            USER_GUID: data["USER_GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
          };
          this.api.PostDataService(`user/update/status`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                // data['ACTIVE_STATUS'] = !data['ACTIVE_STATUS'];
                // this.dataSource.data = this.dataSource.data.filter((u: object) => u['ACTIVE_STATUS']);
                this.FetchAllUser();
                this.common.ShowMessage(res["Message"], "notify-success", 3000);
              } else {
                this.common.ShowMessage(res["Message"], "notify-error", 6000);
              }
            },
            (error) => {
              this.common.ShowMessage(error["Message"], "notify-error", 6000);
            }
          );
        }
      });
  }

  ActivateUser(data: object) {
    let AllData = JSON.parse(JSON.stringify(this.AllData));
    var post = {
      USER_GUID: data["USER_GUID"],
      ACTIVE_STATUS: 1,
    };
    this.api.PostDataService(`user/update/status`, post).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          // data['ACTIVE_STATUS'] = !data['ACTIVE_STATUS'];
          // this.dataSource.data = AllData.filter((u: object) => !u['ACTIVE_STATUS']);
          this.FetchAllUser();
          this.common.ShowMessage(res["Message"], "notify-success", 3000);
        } else {
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }

  // assign services
  AssignServices(user: object) {
    this.api.GetDataService(`user/${user["userId"]}/mappers`).subscribe(
      (res) => {
        const dialogRef = this.dialog.open(AssignServices, {
          width: "30%",
          height: "80%",
          disableClose: true,
        });
        if (res["code"] === 2000 && res["message"] === "SUCESS") {
          const service = res["result"]
            .filter((s: object) => s["rType"] == "SERVICE")
            .map((a: object) => a["rId"]);
          dialogRef.componentInstance.ids = service;
        } else {
          dialogRef.componentInstance.ids = [];
        }
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            if (data.length > 0) {
              this.api
                .PostDataService(
                  `user/${user["userId"]}/assignservices`,
                  data.map((d: object) => d["serviceID"])
                )
                .subscribe(
                  (res) => {
                    if (res["code"] === 2000 && res["message"] === "SUCESS") {
                      this.common.ShowMessage(
                        "Services assigned successfully",
                        "notify-success",
                        3000
                      );
                    } else {
                      this.common.ShowMessage(
                        res["message"],
                        "notify-error",
                        6000
                      );
                    }
                  },
                  (error) => {
                    this.common.ShowMessage(
                      error["message"],
                      "notify-error",
                      6000
                    );
                  }
                );
            }
          }
        });
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  // assign prioority
  AssignPriority(user: object) {
    this.api.GetDataService(`user/${user["userId"]}/mappers`).subscribe(
      (res) => {
        const dialogRef = this.dialog.open(AssignPriority, {
          width: "50%",
          maxHeight: "80%",
          disableClose: true,
        });
        if (res["code"] === 2000 && res["message"] === "SUCESS") {
          const service = res["result"]
            .filter((s: object) => s["rType"] == "PRIORITY")
            .map((a: object) => a["rId"]);
          dialogRef.componentInstance.ids = service;
        } else {
          dialogRef.componentInstance.ids = [];
        }
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            if (data.length > 0) {
              this.api
                .PostDataService(
                  `user/${user["userId"]}/assignpriorities`,
                  data.map((d: object) => d["serviceID"])
                )
                .subscribe(
                  (res) => {
                    if (res["code"] === 2000 && res["message"] === "SUCESS") {
                      this.common.ShowMessage(
                        "Services assigned successfully",
                        "notify-success",
                        3000
                      );
                    } else {
                      this.common.ShowMessage(
                        res["message"],
                        "notify-error",
                        6000
                      );
                    }
                  },
                  (error) => {
                    this.common.ShowMessage(
                      error["message"],
                      "notify-error",
                      6000
                    );
                  }
                );
            }
          }
        });
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  // assign customer type
  AssignCustomerType(user: object) {
    this.api.GetDataService(`user/${user["userId"]}/mappers`).subscribe(
      (res) => {
        const dialogRef = this.dialog.open(AssignCustomerType, {
          width: "50%",
          maxHeight: "80%",
          disableClose: true,
        });
        if (res["code"] === 2000 && res["message"] === "SUCESS") {
          const service = res["result"]
            .filter((s: object) => s["rType"] == "CUSTOMERTYPE")
            .map((a: object) => a["rId"]);
          dialogRef.componentInstance.ids = service;
        } else {
          dialogRef.componentInstance.ids = [];
        }
        dialogRef.afterClosed().subscribe((data: any) => {
          if (data) {
            if (data.length > 0) {
              this.api
                .PostDataService(
                  `user/${user["userId"]}/assigncustomertype`,
                  data.map((d: object) => d["serviceID"])
                )
                .subscribe(
                  (res) => {
                    if (res["code"] === 2000 && res["message"] === "SUCESS") {
                      this.common.ShowMessage(
                        "Services assigned successfully",
                        "notify-success",
                        3000
                      );
                    } else {
                      this.common.ShowMessage(
                        res["message"],
                        "notify-error",
                        6000
                      );
                    }
                  },
                  (error) => {
                    this.common.ShowMessage(
                      error["message"],
                      "notify-error",
                      6000
                    );
                  }
                );
            }
          }
        });
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }
}
