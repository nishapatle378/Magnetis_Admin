import {
  AfterViewInit,
  Component,
  Input,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, of, ReplaySubject, Subject } from "rxjs";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";
// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";

import { AddEditCompanyComponent } from "../add-edit-company/add-edit-company.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
import * as moment from "moment";
import { Title } from "@angular/platform-browser";
import { FormBuilder, FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-company",
  templateUrl: "./view-all-company.component.html",
  styleUrls: ["./view-all-company.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllCompanyComponent implements OnInit {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  subject$: ReplaySubject<object[]> = new ReplaySubject<object[]>(1);
  data$: Observable<object[]> = this.subject$.asObservable();

  user_data: object = {};
  @ViewChild("TABLE") table: ElementRef;
  protected _onDestroy = new Subject<void>();

  @Input()
  columns: ListColumn[] = [
    // { property: 'srn', visible: true, name: 'Sr No' },
    { property: "COMPANY_NAME", visible: true, name: "Company Name" },
    { property: "SHORT_NAME", visible: true, name: "Short Name" },
    { property: "COMPANY_TYPE", visible: true, name: "Company Type" },
    { property: "REGISTRATION_NUM", visible: true, name: "Registration No" },
    { property: "INCORPORATED_ON", visible: true, name: "Incorporated On" },
    { property: "BASE_CURRENCY", visible: true, name: "Base Currency" },
    { property: "OFF_COUNTRY", visible: true, name: "Country" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: MatTableDataSource<object> | null;
  AllData: Array<object> = [];

  AllCountryList: Array<object> = [];
  PrincipalList: Array<object> = [];

  public filtered_principal: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  public filtered_country: ReplaySubject<Array<object>> = new ReplaySubject<
    Array<object>
  >(1);
  filterFormGroup: FormGroup;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  CrewChargesArr: any;
  authGuard: AuthGuard;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private titleService: Title,
    private fb: FormBuilder,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`Company list`);
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  loadSelectableData() {
    const payload = {
      module: ["company_charges", "country"],
      PRINCIPAL_GUID: "all",
    };
    this.api.PostDataService("bulk/get", payload).subscribe((res) => {
      this.CrewChargesArr = res["Data"].company_charges;
      this.AllCountryList = res["Data"].country;
      this.filtered_country.next(this.AllCountryList);
      this.AllData = this.AllData.map((_item) => {
        _item["charges"] = this.CrewChargesArr.filter(
          (_charge) => _charge["PRINCIPAL_GUID"] === _item["COMPANY_GUID"]
        );
        return _item;
      });
    });
    this.dataSource.data = this.AllData;
  }
  getChargesDetail(charges: Array<any>) {
    let strArr = [];
    if (charges) {
      strArr = charges.map(
        (_charge) =>
          `${_charge["PARAMETER_NAME"]}: ${_charge["Charge"].toFixed(2)}`
      );
    }

    return strArr.join("\n");
  }
  clearFilter() {
    this.filterFormGroup.reset();
    this.FetchAllData();
  }

  /**
   * Example on how to get data and pass it to the table - usually you would want a dedicated service with a HTTP request for this
   * We are simulating this request here.
   */

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem("AdminData")).user_data;
    this.dataSource = new MatTableDataSource();
    this.filterFormGroup = this.fb.group({
      SEARCH: [""],
      COUNTRY: [""],
      country_Filter: [""],
    });
    this.FetchAllData();
    this.filterFormGroup.controls["country_Filter"].valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe((val) => {
        this.onFilterChange(
          val,
          "COUNTRY_NAME",
          this.AllCountryList,
          this.filtered_country
        );
      });
  }
  onClickSubmit(data) {
    const url = `company/all?search=${
      data["SEARCH"] ? data["SEARCH"] : ""
    }&country=${data["COUNTRY"] ? data["COUNTRY"] : ""}`;
    this.FetchAllData(url);
  }

  protected onFilterChange(
    search: any,
    property: string,
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
      (s) => s[property].toLowerCase().indexOf(search) > -1
    );
    fiteredList.next(filter);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  exportChargesAsExcel() {
    let crew_services = [];
    let sysData = JSON.parse(localStorage.getItem("systemParamsData"));
    if (sysData) {
      crew_services = sysData.filter(
        (item) =>
          item["PARENT_GUID"] == "Hr5H0YaIH50f0572b-82d6-4e7a-ad24-f9062ae234b2"
      );
    }
    let headers = crew_services.map((_i) => _i["PARAMETER_NAME"]);

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.AllData.map((_item, index) => {
        let row = {
          company_name: _item["COMPANY_NAME"],
        };
        crew_services.forEach((_r) => {
          const _charge = _item["charges"].find(
            (_i) => _i["CREW_TYPE_GUID"] === _r["PARAMETER_GUID"]
          );
          row[_charge["CREW_TYPE_GUID"]] = _charge["Charge"];
        });

        return row;
      })
    );
    let vesselName = [];
    this.AllData.map((_item) => {
      if (!vesselName.includes(_item["Vessel_Name"])) {
        vesselName.push(_item["Vessel_Name"]);
      }
    });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          `Company Crew Charges: ${vesselName.join(",")}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        ["Company Name", ...headers],
      ],
      { origin: "A1" }
    );
    // ws["!cols"] = this.fitToColumn([
    //   [
    //     { width: 20 },
    //     { width: 50 },
    //     { width: 150 },
    //     { width: 150 },
    //     { width: 150 },
    //     { width: 150 },
    //     { width: 150 },
    //     { width: 400 },
    //     { width: 150 },
    //     { width: 150 },
    //   ],
    // ]);
    var merge = { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } };
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push(merge);

    /* save to file */
    XLSX.writeFile(wb, `Crew_Charges_${moment().format("DDMMMYYYY")}.xlsx`);
  }
  fitToColumn(arrayOfArray) {
    // get maximum character of each column
    return arrayOfArray[0].map((a, i) => ({
      wch: Math.max(
        ...arrayOfArray.map((a2) => (a2[i] ? a2[i].toString().length : 0))
      ),
    }));
  }
  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    ); //converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    /* save to file */
    XLSX.writeFile(wb, "Company.xlsx");
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

  FetchAllData(url = "company/all") {
    this.api.GetDataService(url).subscribe(
      (res) => {
        if (res["Status"] === 200) {
          res["Data"].forEach((d: object) => {
            var dt = new Date(d["INCORPORATED_ON"]);
            d["user"] =
              this.user_data["USER_FIRST_NAME"] +
              " " +
              this.user_data["USER_LAST_NAME"];
            d["INCORPORATED_ON"] = `${dt.getDate()}-${
              dt.getMonth() + 1 > 9
                ? dt.getMonth() + 1
                : "0" + (dt.getMonth() + 1)
            }-${dt.getFullYear()}`;
            d["INCORPORATED_DATE"] = `${dt.getFullYear()}-${
              dt.getMonth() + 1 > 9
                ? dt.getMonth() + 1
                : "0" + (dt.getMonth() + 1)
            }-${dt.getDate()}`;

            d["VIEW_INCORPORATED_ON"] = `${dt.getDate()}/${
              dt.getMonth() + 1 > 9
                ? dt.getMonth() + 1
                : "0" + (dt.getMonth() + 1)
            }/${dt.getFullYear()}`;
            d["VIEW_INCORPORATED_DATE"] = `${dt.getFullYear()}/${
              dt.getMonth() + 1 > 9
                ? dt.getMonth() + 1
                : "0" + (dt.getMonth() + 1)
            }/${dt.getDate()}`;
          });
          this.dataSource.data = res["Data"].filter(
            (u: object) => u["ACTIVE_STATUS"]
          );
          this.AllData = res["Data"];
          this.loadSelectableData();
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  // OpenModificationInfo(data: object) {
  //   const dialogRef = this.dialog.open(ModificationInfoComponent, {
  //     disableClose: true,
  //     width: '30%',
  //   });
  //   dialogRef.componentInstance.UserData = data;

  //   dialogRef.afterClosed().subscribe((data: any) => {

  //   });
  // }
  SaveData(data: object, IsEdit: boolean) {
    const dialogRef = this.dialog.open(AddEditCompanyComponent, {
      width: "80%",
      maxHeight: "80%",
      disableClose: true,
    });
    dialogRef.componentInstance.EditData = data;
    dialogRef.componentInstance.IsEdit = IsEdit;
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.onClickSubmit(this.filterFormGroup.value);
      }
    });
  }

  ngOnDestroy() {}

  ChangeStatus(data: object) {
    const dialogRef = this.dialog.open(StatusChangeConfirmation, {
      disableClose: false,
    });

    if (!data["ACTIVE_STATUS"]) {
      dialogRef.componentInstance.title = "Active Record!";
      dialogRef.componentInstance.message =
        "Are you sure want to active this record ?";
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var post = {
          COMPANY_GUID: data["COMPANY_GUID"],
          ACTIVE_STATUS: !data["ACTIVE_STATUS"],
        };
        this.api.PostDataService(`company/update/status`, post).subscribe(
          (res: object) => {
            if (res["Status"] === 200) {
              data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
              this.AllData.forEach((a: any) => {
                if (a.COMPANY_GUID == data["COMPANY_GUID"]) {
                  a["ACTIVE_STATUS"] = data["ACTIVE_STATUS"];
                }
              });
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
