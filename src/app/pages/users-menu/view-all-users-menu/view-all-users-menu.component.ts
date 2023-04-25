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

import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "view-all-users-menu",
  templateUrl: "./view-all-users-menu.component.html",
  styleUrls: ["./view-all-users-menu.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllUsersMenuComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  customers: any[];
  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "user_name", visible: true, name: "User Name" },
    { property: "phone_number", visible: true, name: "Phone Number" },
    { property: "email", visible: true, name: "Email" },
    { property: "designation", visible: true, name: "Designation" },
    { property: "dob", visible: true, name: "DOB" },
    { property: "address", visible: true, name: "Address" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];
  submit: boolean = false;

  menu_columns = ["menu", "access", "menu_remarks", "remarks"];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  menu_list: Array<object> = [];
  user_menu_access_list: Array<object> = [];
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
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

  parentServiceSelected(service: object) {
    if (service["children"]) {
      if (service["children"].length > 0) {
        service["children"].forEach((child: object) => {
          child["selected"] = service["selected"];
          this.parentServiceSelected(child);
        });
      }
    }
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Users.xlsx");
  }

  select_user(u: object) {
    this.AllData.forEach((d: any) => {
      d.selected = false;
    });
    this.menu_list.forEach((d: any) => {
      d.selected = false;
      if (d.children) {
        d.children.forEach((d: any) => {
          d.selected = false;
        });
      }
    });
    u["selected"] = true;
    this.dataSource.data = [];
  }

  unselect_all(row: any) {
    row["all_selected"] = false;
  }

  select_all(m: any) {
    m["selected"] = true;
    m["all_selected"] = m.all_selected;
    m["menu_selected"] = m.all_selected;
    m["view_selected"] = m.all_selected;
    m["add_selected"] = m.all_selected;
    m["edit_selected"] = m.all_selected;
    m["delete_selected"] = m.all_selected;
    m["approve_selected"] = m.all_selected;
    m["export_selected"] = m.all_selected;
    m["verify_selected"] = m.all_selected;
    m["hide_from_menu_selected"] = m.all_selected;
  }

  select_module(m: object) {
    this.menu_list.forEach((d: any) => {
      d.selected = false;
      if (d.children) {
        d.children.forEach((d: any) => {
          d.selected = false;
        });
      }
    });
    var menu_access_list = [];
    var selected_user = this.AllData.filter((u: any) => u.selected);

    if (selected_user.length > 0) {
      menu_access_list = this.user_menu_access_list.filter(
        (menu: any) => menu.USER_GUID == selected_user[0]["USER_GUID"]
      );
    }

    m["selected"] = true;
    m["all_selected"] = false;
    m["menu_selected"] = false;
    m["view_selected"] = false;
    m["add_selected"] = false;
    m["edit_selected"] = false;
    m["delete_selected"] = false;
    m["approve_selected"] = false;
    m["export_selected"] = false;
    m["verify_selected"] = false;
    m["hide_from_menu_selected"] = false;
    m["menu_remarks"] = "";
    m["modify_menu_remarks"] = "";

    menu_access_list.forEach((menu: any) => {
      if (menu.MENU_GUID == m["MENU_GUID"]) {
        m["all_selected"] = false;
        m["menu_selected"] = menu.MENU_ACCESS;
        m["view_selected"] = menu.VIEW_ACCESS;
        m["add_selected"] = menu.ADD_ACCESS;
        m["edit_selected"] = menu.EDIT_ACCESS;
        m["delete_selected"] = menu.DELETE_ACCESS;
        m["approve_selected"] = menu.APPROVE_ACCESS;
        m["export_selected"] = menu.EXPORT_ACCESS;
        m["verify_selected"] = menu.VERIFY_ACCESS;
        m["hide_from_menu_selected"] = menu.Hide_From_Menu;
      }
    });

    m["children"].forEach((c: object) => {
      c["all_selected"] = false;
      c["menu_selected"] = false;
      c["view_selected"] = false;
      c["add_selected"] = false;
      c["edit_selected"] = false;
      c["delete_selected"] = false;
      c["approve_selected"] = false;
      c["export_selected"] = false;
      c["verify_selected"] = false;
      c["hide_from_menu_selected"] = false;
      c["menu_remarks"] = "";
      c["modify_menu_remarks"] = "";
      menu_access_list.forEach((menu: any) => {
        if (menu.MENU_GUID == c["MENU_GUID"]) {
          c["all_selected"] = false;
          c["menu_selected"] = menu.MENU_ACCESS;
          c["view_selected"] = menu.VIEW_ACCESS;
          c["add_selected"] = menu.ADD_ACCESS;
          c["edit_selected"] = menu.EDIT_ACCESS;
          c["delete_selected"] = menu.DELETE_ACCESS;
          c["approve_selected"] = menu.APPROVE_ACCESS;
          c["export_selected"] = menu.EXPORT_ACCESS;
          c["verify_selected"] = menu.VERIFY_ACCESS;
          c["hide_from_menu_selected"] = menu.Hide_From_Menu;
        }
      });
    });

    this.dataSource.data = m["children"].length > 0 ? m["children"] : [m];
  }

  select_children(parent: any, child: any) {
    this.menu_list.forEach((d: any) => {
      d.selected = false;
      if (d.children) {
        d.children.forEach((d: any) => {
          d.selected = false;
        });
      }
    });
    child.selected = true;
  }

  FilterDataStatus(type: string) {
    var data = JSON.parse(JSON.stringify(this.AllData));
    if (type == "Activated") {
      this.dataSource.data = data.filter((u: object) => u["ACTIVE_STATUS"]);
    } else if (type == "Deleted") {
      this.dataSource.data = data.filter((u: object) => !u["ACTIVE_STATUS"]);
    } else {
      this.dataSource.data = data;
    }
  }

  FetchAllUser() {
    this.api.GetDataService("user/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.AllData = res["Data"].filter((d: any) => d.ACTIVE_STATUS);
          this.AllData.forEach((u: any) => {
            u["selected"] = false;
          });
          this.FetchAllMenus();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  FetchAllMenus() {
    this.api.GetDataService("menu/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          res["Data"].forEach((m: object) => {
            m["selected"] = false;
            m["expandable"] = false;
            if (m["children"]) {
              if (m["children"].length > 0) {
                m["children"].forEach((c: object) => {
                  c["selected"] = false;
                  c["expandable"] = false;
                });
              }
            }
          });
          this.menu_list = res["Data"];
          this.FetchAllUserMenu();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  FetchAllUserMenu() {
    this.api.GetDataService("um/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.user_menu_access_list = res["Data"];
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  SaveUserMenu() {
    if (this.submit) {
      return;
    }
    this.submit = true;
    var selected_user = this.AllData.filter((u: any) => u.selected);
    if (selected_user.length == 0) {
      this.common.ShowMessage("Please select user", "notify-error", 6000);
      return;
    }
    if (this.dataSource.data.length == 0) {
      this.common.ShowMessage(
        "Please select menu to assign",
        "notify-error",
        6000
      );
      return;
    }

    var user_menu_right = [];
    this.dataSource.data.forEach((d: any) => {
      user_menu_right.push({
        USER_GUID: selected_user[0]["USER_GUID"],
        MENU_GUID: d["MENU_GUID"],
        MENU_ACCESS: d["menu_selected"],
        VIEW_ACCESS: d["view_selected"],
        ADD_ACCESS: d["add_selected"],
        EDIT_ACCESS: d["edit_selected"],
        DELETE_ACCESS: d["delete_selected"],
        APPROVE_ACCESS: d["approve_selected"],
        VERIFY_ACCESS: d["verify_selected"],
        EXPORT_ACCESS: d["export_selected"],
        Hide_From_Menu: d["hide_from_menu_selected"],
        CREATED_BY: "ADMIN",
      });
    });
    this.SaveMenu(user_menu_right, "um/insert");
  }

  // this function is used to save user
  SaveMenu(data: any, path: string) {
    this.api.PostDataService(path, data).subscribe(
      (res: object) => {
        this.submit = false;
        if (res["Status"] === 200) {
          this.FetchAllUserMenu();
          this.common.ShowMessage(
            "User menu saved successfully",
            "notify-success",
            3000
          );
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
}
