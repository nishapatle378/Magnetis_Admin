import {
  AfterViewInit,
  Component,
  Input,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";

// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditCurrencyComponent } from "../add-edit-currency/add-edit-currency.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-currency",
  templateUrl: "./view-all-currency.component.html",
  styleUrls: ["./view-all-currency.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
})
export class ViewAllCurrencyComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  data$: Observable<any[]> = this.subject$.asObservable();
  anys: any[];
  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    // { property: 'srn', visible: true, name: 'Sr No' },
    { property: "SHORT_CODE", visible: true, name: "Short Code" },
    { property: "COUNTRY_NAME", visible: true, name: "Country" },
    { property: "DESCRIPTION", visible: true, name: "Description" },
    { property: "Called_As", visible: true, name: "Called As" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<any> | null;
  AllData: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Currency list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.FetchAllData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Currency.xlsx");
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

  FetchAllData() {
    this.api.GetDataService("currency/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          this.dataSource.data = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
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

  OpenModificationInfo(data: object) {
    const dialogRef = this.dialog.open(ModificationInfoComponent, {
      disableClose: true,
      width: "30%",
    });
    dialogRef.componentInstance.UserData = data;

    dialogRef.afterClosed().subscribe((data: any) => {});
  }
  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditCurrencyComponent, {
      width: "50%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.FetchAllData();
      }
    });
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
            CURRENCY_GUID: data["CURRENCY_GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
          };
          this.api.PostDataService(`currency/update/status`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                this.dataSource.data = this.dataSource.data.filter(
                  (u: object) => u["ACTIVE_STATUS"]
                );
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
}
