import {
  AfterViewInit,
  Component,
  Input,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  OnDestroy,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as XLSX from "xlsx";
import { ListColumn } from "../../../../@fury/shared/list/list-column.model";
import { fadeInRightAnimation } from "../../../../@fury/animations/fade-in-right.animation";
import { fadeInUpAnimation } from "../../../../@fury/animations/fade-in-up.animation";
// service
import { ApiService } from "../../../providers/services/ApiService";
import { CommonService } from "../../../providers/services/CommonService";
import { SidenavService } from "../../../layout/sidenav/sidenav.service";

import { AddEditSystemParameterComponent } from "../add-edit-system-parameter/add-edit-system-parameter.component";
import { StatusChangeConfirmation } from "../../../common-component/status-change-confirmation/status-change-confirmation.component";
// import { ModificationInfoComponent } from "../../../common-component/modification-info/modification-info.component";
import { SysParamSortComponent } from "../sys-param-sort/sys-param-sort.component";
import { Title } from "@angular/platform-browser";
import { AuthGuard } from "src/app/providers/auth/AuthGuard";

@Component({
  selector: "fury-view-all-system-parameter",
  templateUrl: "./view-all-system-parameter.component.html",
  styleUrls: ["./view-all-system-parameter.component.scss"],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAllSystemParameterComponent implements OnInit, OnDestroy {
  /**
   * Simulating a service with HTTP that returns Observables
   * You probably want to remove this and do all requests in a service with HTTP
   */
  @ViewChild("TABLE") table: ElementRef;

  @Input()
  columns: ListColumn[] = [
    { property: "name", visible: true, name: "Name" },
    { property: "Action", visible: true, name: "Action" },
  ] as ListColumn[];
  pageSize = 10;
  dataSource: any;
  displayedColumns: string[] = ["short_name", "name", "remarks", "Action"];

  moduleDataSource: any;
  parentDataSource: any;
  childDataSource: any;
  grandDataSource: any;
  greatDataSource: any;

  moduleDataSource2: Array<object> = [];
  parentDataSource2: Array<object> = [];
  childDataSource2: Array<object> = [];
  grandDataSource2: Array<object> = [];
  greatDataSource2: Array<object> = [];

  AllData: Array<object> = [];

  moduleDataType: string = "Activated";
  parentDataType: string = "Activated";
  childDataType: string = "Activated";
  grandDataType: string = "Activated";
  greatDataType: string = "Activated";

  moduleSearch: string = "";
  parentSearch: string = "";
  childSearch: string = "";
  grandSearch: string = "";
  greatSearch: string = "";

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild("modulePaginator") modulePaginator: MatPaginator;
  @ViewChild("parentPaginator") parentPaginator: MatPaginator;
  @ViewChild("childPaginator") childPaginator: MatPaginator;
  @ViewChild("grandPaginator") grandPaginator: MatPaginator;
  @ViewChild("greatPaginator") greatPaginator: MatPaginator;
  authGuard: AuthGuard;

  // @ViewChild(MatPaginator, { static: true }) paginator2: MatPaginator;
  // @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private common: CommonService,
    private sidenavService: SidenavService,
    private titleService: Title,
    private auth: AuthGuard
  ) {
    this.authGuard = this.auth;
    this.titleService.setTitle(`System parameter list`);
  }
  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  ngOnInit() {
    this.parentDataSource = new MatTableDataSource();
    this.moduleDataSource = new MatTableDataSource();
    this.childDataSource = new MatTableDataSource();
    this.grandDataSource = new MatTableDataSource();
    this.greatDataSource = new MatTableDataSource();
    sessionStorage.setItem("section", "module");
    this.FetchAllData();
  }

  ngAfterViewInit() {
    // this.theme.setNavigation('top')
    this.sidenavService.setCollapsed(true);
    // this.sidenavService.close();
    this.moduleDataSource.paginator = this.modulePaginator;
    this.parentDataSource.paginator = this.parentPaginator;
    this.childDataSource.paginator = this.childPaginator;
    this.grandDataSource.paginator = this.grandPaginator;
    this.greatDataSource.paginator = this.greatPaginator;
    // this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.sidenavService.setCollapsed(false);
  }

  FetchAllData(reset = true) {
    this.api.GetDataService("sp/all").subscribe(
      (res) => {
        if (res["Status"] === 200) {
          // this.dataSource.data = res['Data'].filter((u: object) => u['ACTIVE_STATUS']);
          this.AllData = res["Data"];
          this.AllData.forEach((a: any) => {
            a.selected = false;
          });
          localStorage.setItem("systemParamsData", JSON.stringify(res["Data"]));

          this.moduleDataSource2 = this.AllData.filter(
            (a: any) => !a.PARENT_GUID
          );
          if (reset) {
            this.moduleDataSource.data = this.AllData.filter(
              (a: any) => !a.PARENT_GUID && a.ACTIVE_STATUS
            );
            this.parentDataSource.data = [];
            this.childDataSource.data = [];
            this.grandDataSource.data = [];
            this.greatDataSource.data = [];
          }
        } else {
          this.common.ShowMessage(res["message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["message"], "notify-error", 6000);
      }
    );
  }

  FilterDataStatus(value: string, type: string) {
    console.log("apply filter");
    if (type == "module") {
      var data = JSON.parse(JSON.stringify(this.moduleDataSource2));
      data.forEach((d: any) => {
        d["selected"] = false;
      });
      if (value == "Activated") {
        this.moduleDataSource.data = data.filter(
          (u: object) => u["ACTIVE_STATUS"]
        );
      } else if (value == "Deleted") {
        this.moduleDataSource.data = data.filter(
          (u: object) => !u["ACTIVE_STATUS"]
        );
      } else {
        this.moduleDataSource.data = data;
      }
      this.parentDataSource.data = [];
      this.childDataSource.data = [];
      this.grandDataSource.data = [];
      this.greatDataSource.data = [];
    }

    if (type == "parent") {
      var data = JSON.parse(JSON.stringify(this.parentDataSource2));
      data.forEach((d: any) => {
        d["selected"] = false;
      });
      if (value == "Activated") {
        this.parentDataSource.data = data.filter(
          (u: object) => u["ACTIVE_STATUS"]
        );
      } else if (value == "Deleted") {
        this.parentDataSource.data = data.filter(
          (u: object) => !u["ACTIVE_STATUS"]
        );
      } else {
        this.parentDataSource.data = data;
      }
      this.childDataSource.data = [];
      this.grandDataSource.data = [];
      this.greatDataSource.data = [];
    }

    if (type == "child") {
      var data = JSON.parse(JSON.stringify(this.childDataSource2));
      data.forEach((d: any) => {
        d["selected"] = false;
      });
      if (value == "Activated") {
        this.childDataSource.data = data.filter(
          (u: object) => u["ACTIVE_STATUS"]
        );
      } else if (value == "Deleted") {
        this.childDataSource.data = data.filter(
          (u: object) => !u["ACTIVE_STATUS"]
        );
      } else {
        this.childDataSource.data = data;
      }
      this.grandDataSource.data = [];
      this.greatDataSource.data = [];
    }

    if (type == "grand") {
      var data = JSON.parse(JSON.stringify(this.grandDataSource2));
      data.forEach((d: any) => {
        d["selected"] = false;
      });
      if (value == "Activated") {
        this.grandDataSource.data = data.filter(
          (u: object) => u["ACTIVE_STATUS"]
        );
      } else if (value == "Deleted") {
        this.grandDataSource.data = data.filter(
          (u: object) => !u["ACTIVE_STATUS"]
        );
      } else {
        this.grandDataSource.data = data;
      }
      this.greatDataSource.data = [];
    }

    if (type == "great") {
      var data = JSON.parse(JSON.stringify(this.greatDataSource2));
      data.forEach((d: any) => {
        d["selected"] = false;
      });
      if (value == "Activated") {
        this.greatDataSource.data = data.filter(
          (u: object) => u["ACTIVE_STATUS"]
        );
      } else if (value == "Deleted") {
        this.greatDataSource.data = data.filter(
          (u: object) => !u["ACTIVE_STATUS"]
        );
      } else {
        this.greatDataSource.data = data;
      }
    }
  }

  onFilterChange(value: string, type: string) {
    // if (!this.moduleDataSource) {
    //   return;
    // }
    value = value.trim();
    value = value.toLowerCase();
    if (type == "module") {
      this.moduleDataSource.filter = value;
    }
    if (type == "parent") {
      this.parentDataSource.filter = value;
    }
    if (type == "child") {
      this.childDataSource.filter = value;
    }
    if (type == "grand") {
      this.grandDataSource.filter = value;
    }
    if (type == "great") {
      this.greatDataSource.filter = value;
    }
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
  selectedData = null;
  selectedModuleData = null;
  selectedParentData = null;
  selectedChildData = null;
  selectedGrandData = null;
  selectedGreatData = null;

  selectSP(data: any, type: string) {
    console.log(data, "sysdata");
    sessionStorage.setItem("section", type);
    if (type == "module") {
      this.selectedModuleData = data;
      this.selectedParentData = null;
      this.selectedChildData = null;
      this.selectedGrandData = null;
      this.selectedGreatData = null;
    } else if (type == "parent") {
      // this.selectedModuleData = null;
      this.selectedParentData = data;
      this.selectedChildData = null;
      this.selectedGrandData = null;
      this.selectedGreatData = null;
    } else if (type == "child") {
      // this.selectedModuleData = null;
      // this.selectedParentData = null;
      this.selectedChildData = data;
      this.selectedGrandData = null;
      this.selectedGreatData = null;
    } else if (type == "grand") {
      // this.selectedModuleData = null;
      // this.selectedParentData = null;
      // this.selectedChildData = null;
      this.selectedGrandData = data;
      this.selectedGreatData = null;
    } else if (type == "great") {
      // this.selectedModuleData = null;
      // this.selectedParentData = null;
      // this.selectedChildData = null;
      // this.selectedGrandData = null;
      this.selectedGreatData = data;
    }

    if (type == "module") {
      this.moduleDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
      data.selected = true;
      this.parentDataSource.data = this.AllData.filter(
        (d: object) =>
          d["PARENT_GUID"] == data.PARAMETER_GUID && d["ACTIVE_STATUS"]
      );
      this.parentDataSource2 = this.AllData.filter(
        (d: object) => d["PARENT_GUID"] == data.PARAMETER_GUID
      );
      this.childDataSource.data = [];
      this.grandDataSource.data = [];
      this.greatDataSource.data = [];
      this.parentDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
    }

    if (type == "parent") {
      this.parentDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
      data.selected = true;
      this.childDataSource.data = this.AllData.filter(
        (d: object) =>
          d["PARENT_GUID"] == data.PARAMETER_GUID && d["ACTIVE_STATUS"]
      );
      this.childDataSource2 = this.AllData.filter(
        (d: object) => d["PARENT_GUID"] == data.PARAMETER_GUID
      );
      this.grandDataSource.data = [];
      this.greatDataSource.data = [];
      this.childDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
    }

    if (type == "child") {
      this.childDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
      data.selected = true;
      this.grandDataSource.data = this.AllData.filter(
        (d: object) =>
          d["PARENT_GUID"] == data.PARAMETER_GUID && d["ACTIVE_STATUS"]
      );
      this.grandDataSource2 = this.AllData.filter(
        (d: object) => d["PARENT_GUID"] == data.PARAMETER_GUID
      );
      this.greatDataSource.data = [];
      this.grandDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
    }

    if (type == "grand") {
      this.grandDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
      data.selected = true;
      this.greatDataSource.data = this.AllData.filter(
        (d: object) =>
          d["PARENT_GUID"] == data.PARAMETER_GUID && d["ACTIVE_STATUS"]
      );
      this.greatDataSource2 = this.AllData.filter(
        (d: object) => d["PARENT_GUID"] == data.PARAMETER_GUID
      );
      this.greatDataSource.data.forEach((d: any) => {
        d.selected = false;
      });
    }
  }

  removeFilter(type: string) {
    if (type == "module") {
      this.moduleSearch = "";
      this.moduleDataType = "Activated";
      this.FilterDataStatus("Activated", type);
      this.onFilterChange("", type);
    }
    if (type == "parent") {
      this.parentSearch = "";
      this.parentDataType = "Activated";
      this.FilterDataStatus("Activated", type);
      this.onFilterChange("", type);
    }
    if (type == "child") {
      this.childSearch = "";
      this.childDataType = "Activated";
      this.FilterDataStatus("Activated", type);
      this.onFilterChange("", type);
    }
    if (type == "grand") {
      this.grandSearch = "";
      this.grandDataType = "Activated";
      this.FilterDataStatus("Activated", type);
      this.onFilterChange("", type);
    }
    if (type == "great") {
      this.greatSearch = "";
      this.greatDataType = "Activated";
      this.FilterDataStatus("Activated", type);
      this.onFilterChange("", type);
    }
  }

  // OpenModificationInfo(data: object) {
  //   const dialogRef = this.dialog.open(ModificationInfoComponent, {
  //     disableClose: true,
  //     width: "30%",
  //   });
  //   dialogRef.componentInstance.UserData = data;
  //   dialogRef.afterClosed().subscribe((data: any) => {});
  // }

  handleSortModal(data: any) {
    const dialogRef = this.dialog.open(SysParamSortComponent, {
      width: "50%",
      maxHeight: "80%",
    });
    dialogRef.componentInstance.selectedModuleData = data;
    const thisRef = this;
    dialogRef.afterClosed().subscribe((res: any) => {
      if (res) {
        thisRef.FetchAllData();
      }
    });
  }
  SaveData(data: object, IsEdit: boolean = false, title: string, type: string) {
    let section = sessionStorage.getItem("section");
    // this.removeFilter(type);
    if (
      this.selectedModuleData &&
      Object.keys(this.selectedModuleData).length == 0
    )
      this.selectedModuleData = null;
    if (
      this.selectedParentData &&
      Object.keys(this.selectedParentData).length == 0
    )
      this.selectedParentData = null;
    if (
      this.selectedChildData &&
      Object.keys(this.selectedChildData).length == 0
    )
      this.selectedChildData = null;
    if (
      this.selectedGrandData &&
      Object.keys(this.selectedGrandData).length == 0
    )
      this.selectedGrandData = null;
    if (
      this.selectedGreatData &&
      Object.keys(this.selectedGreatData).length == 0
    )
      this.selectedGreatData = null;
    if (
      (section == "module" && ["child", "grand", "great"].includes(type)) ||
      (type == "parent" && !this.selectedModuleData)
    ) {
      this.common.ShowMessage(
        "Invalid Section selection",
        "notify-error",
        6000
      );
    } else if (
      (section == "parent" && ["grand", "great"].includes(type)) ||
      (type == "parent" && !this.selectedParentData && !this.selectedModuleData)
    ) {
      this.common.ShowMessage(
        "Invalid Section selection",
        "notify-error",
        6000
      );
    } else if (
      (section == "child" && ["great"].includes(type)) ||
      (type == "child" &&
        (!this.selectedParentData || !this.selectedModuleData))
    ) {
      this.common.ShowMessage(
        "Invalid Section selection",
        "notify-error",
        6000
      );
    } else if (
      section == "grand" &&
      type == "grand" &&
      !this.selectedGrandData &&
      this.selectedChildData &&
      this.selectedParentData &&
      this.selectedModuleData
    ) {
      this.common.ShowMessage(
        "Invalid Section selection",
        "notify-error",
        6000
      );
    } else {
      console.log("Update modul data", data);
      if (type == "module") {
        this.selectedModuleData = data;
        this.selectedParentData = null;
        this.selectedChildData = null;
        this.selectedGrandData = null;
        this.selectedGreatData = null;
      } else if (type == "parent") {
        this.selectedParentData = data;
        this.selectedChildData = null;
        this.selectedGrandData = null;
        this.selectedGreatData = null;
      } else if (type == "child") {
        this.selectedChildData = data;
        this.selectedGrandData = null;
        this.selectedGreatData = null;
      } else if (type == "grand") {
        this.selectedGrandData = data;
        this.selectedGreatData = null;
      } else if (type == "great") {
        this.selectedGreatData = data;
      }
      const dialogRef = this.dialog.open(AddEditSystemParameterComponent, {
        width: "50%",
        maxHeight: "80%",
        disableClose: true,
      });
      dialogRef.componentInstance.EditData = data;
      dialogRef.componentInstance.IsEdit = IsEdit;
      dialogRef.componentInstance.title = title;
      dialogRef.componentInstance.type = type;
      dialogRef.componentInstance.AllData = this.AllData;
      dialogRef.componentInstance.selectedModuleData = this.selectedModuleData;
      dialogRef.componentInstance.selectedParentData = this.selectedParentData;
      dialogRef.componentInstance.selectedChildData = this.selectedChildData;
      dialogRef.componentInstance.selectedGrandData = this.selectedGrandData;
      dialogRef.componentInstance.selectedGreatData = this.selectedGreatData;

      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          console.log("afterClosed", res);
          if (IsEdit) {
            res.selected = data["selected"];
            this.AllData = this.AllData.map((a: any, index: number) => {
              if (a["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                a = res;
              }
              return a;
            });
            if (type == "module") {
              var dt = JSON.parse(JSON.stringify(this.moduleDataSource.data));
              dt.forEach((d: any, index: number) => {
                if (d["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                  dt[index] = res;
                }
              });
              this.moduleDataSource.data = dt;
            }
            if (type == "parent") {
              var dt = JSON.parse(JSON.stringify(this.parentDataSource.data));
              dt.forEach((d: any, index: number) => {
                if (d["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                  dt[index] = res;
                }
              });
              this.parentDataSource.data = dt;
            }
            if (type == "child") {
              var dt = JSON.parse(JSON.stringify(this.childDataSource.data));
              dt.forEach((d: any, index: number) => {
                if (d["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                  dt[index] = res;
                }
              });
              this.childDataSource.data = dt;
            }
            if (type == "grand") {
              var dt = JSON.parse(JSON.stringify(this.grandDataSource.data));
              dt.forEach((d: any, index: number) => {
                if (d["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                  dt[index] = res;
                }
              });
              this.grandDataSource.data = dt;
            }
            if (type == "great") {
              var dt = JSON.parse(JSON.stringify(this.greatDataSource.data));
              dt.forEach((d: any, index: number) => {
                if (d["PARAMETER_GUID"] == res["PARAMETER_GUID"]) {
                  dt[index] = res;
                }
              });
              this.greatDataSource.data = dt;
            }
          } else {
            this.AllData.push(res);
            if (type == "module") {
              var dt = JSON.parse(JSON.stringify(this.moduleDataSource.data));
              dt.push(res);
              this.moduleDataSource.data = dt;
            }
            if (type == "parent") {
              var dt = JSON.parse(JSON.stringify(this.parentDataSource.data));
              dt.push(res);
              this.parentDataSource.data = dt;
            }
            if (type == "child") {
              var dt = JSON.parse(JSON.stringify(this.childDataSource.data));
              dt.push(res);
              this.childDataSource.data = dt;
            }
            if (type == "grand") {
              var dt = JSON.parse(JSON.stringify(this.grandDataSource.data));
              dt.push(res);
              this.grandDataSource.data = dt;
            }
            if (type == "great") {
              var dt = JSON.parse(JSON.stringify(this.greatDataSource.data));
              dt.push(res);
              this.greatDataSource.data = dt;
            }
          }
        }
      });
    }
  }

  ChangeStatus(data: object, type: string) {
    this.dialog
      .open(StatusChangeConfirmation, {
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          var post = {
            PARAMETER_GUID: data["PARAMETER_GUID"],
            ACTIVE_STATUS: !data["ACTIVE_STATUS"],
            DELETED_BY: "ADMIN",
          };
          this.api.PostDataService(`sp/update/status`, post).subscribe(
            (res: object) => {
              if (res["Status"] === 200) {
                data["selected"] = false;
                data["ACTIVE_STATUS"] = !data["ACTIVE_STATUS"];
                if (type == "module") {
                  this.moduleDataSource.data =
                    this.moduleDataSource.data.filter(
                      (u: object) => u["ACTIVE_STATUS"]
                    );
                  this.moduleDataSource2.forEach((d: any, ind) => {
                    if (d["PARAMETER_GUID"] == data["PARAMETER_GUID"]) {
                      this.moduleDataSource2[ind]["ACTIVE_STATUS"] =
                        data["ACTIVE_STATUS"];
                    }
                  });
                  var isItemRemoved = false;
                  this.parentDataSource.data.forEach((d: any) => {
                    if (d.PARENT_GUID == data["PARAMETER_GUID"]) {
                      isItemRemoved = true;
                    }
                  });
                  if (isItemRemoved) {
                    this.parentDataSource.data = [];
                    this.childDataSource.data = [];
                    this.grandDataSource.data = [];
                    this.greatDataSource.data = [];
                  }
                }
                if (type == "parent") {
                  this.parentDataSource.data =
                    this.parentDataSource.data.filter(
                      (u: object) => u["ACTIVE_STATUS"]
                    );
                  this.parentDataSource2.forEach((d: any, ind) => {
                    if (d["PARAMETER_GUID"] == data["PARAMETER_GUID"]) {
                      this.parentDataSource2[ind]["ACTIVE_STATUS"] =
                        data["ACTIVE_STATUS"];
                    }
                  });
                  var isItemRemoved = false;
                  this.grandDataSource.data.forEach((d: any) => {
                    if (d.PARENT_GUID == data["PARAMETER_GUID"]) {
                      isItemRemoved = true;
                    }
                  });
                  if (isItemRemoved) {
                    this.childDataSource.data = [];
                    this.grandDataSource.data = [];
                    this.greatDataSource.data = [];
                  }
                }
                if (type == "child") {
                  this.childDataSource.data = this.childDataSource.data.filter(
                    (u: object) => u["ACTIVE_STATUS"]
                  );
                  this.childDataSource2.forEach((d: any, ind) => {
                    if (d["PARAMETER_GUID"] == data["PARAMETER_GUID"]) {
                      this.childDataSource2[ind]["ACTIVE_STATUS"] =
                        data["ACTIVE_STATUS"];
                    }
                  });
                  var isItemRemoved = false;
                  this.grandDataSource.data.forEach((d: any) => {
                    if (d.PARENT_GUID == data["PARAMETER_GUID"]) {
                      isItemRemoved = true;
                    }
                  });
                  if (isItemRemoved) {
                    this.grandDataSource.data = [];
                    this.greatDataSource.data = [];
                  }
                }
                if (type == "grand") {
                  this.grandDataSource.data = this.grandDataSource.data.filter(
                    (u: object) => u["ACTIVE_STATUS"]
                  );
                  this.grandDataSource2.forEach((d: any, ind) => {
                    if (d["PARAMETER_GUID"] == data["PARAMETER_GUID"]) {
                      this.grandDataSource2[ind]["ACTIVE_STATUS"] =
                        data["ACTIVE_STATUS"];
                    }
                  });
                  var isItemRemoved = false;
                  this.greatDataSource.data.forEach((d: any) => {
                    if (d.PARENT_GUID == data["PARAMETER_GUID"]) {
                      isItemRemoved = true;
                    }
                  });
                  if (isItemRemoved) {
                    this.greatDataSource.data = [];
                  }
                }
                if (type == "great") {
                  this.greatDataSource.data = this.greatDataSource.data.filter(
                    (u: object) => u["ACTIVE_STATUS"]
                  );
                  this.greatDataSource2.forEach((d: any, ind) => {
                    if (d["PARAMETER_GUID"] == data["PARAMETER_GUID"]) {
                      this.greatDataSource2[ind]["ACTIVE_STATUS"] =
                        data["ACTIVE_STATUS"];
                    }
                  });
                }

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
