import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { ListColumn } from "src/@fury/shared/list/list-column.model";
import { ApiService } from "src/app/providers/services/ApiService";
import { CommonService } from "src/app/providers/services/CommonService";

@Component({
  selector: "fury-sys-param-sort",
  templateUrl: "./sys-param-sort.component.html",
  styleUrls: ["./sys-param-sort.component.scss"],
})
export class SysParamSortComponent implements OnInit, OnDestroy {
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
  selectedModuleData: any;
  sortedModuleList: any;

  @ViewChild("modulePaginator") modulePaginator: MatPaginator;

  constructor(
    private dialogRef: MatDialogRef<SysParamSortComponent>,
    private api: ApiService,
    private common: CommonService
  ) {}

  ngOnDestroy(): void {
   
  }

  ngOnInit(): void {
    this.moduleDataSource = new MatTableDataSource();
    if (this.selectedModuleData) {
      this.moduleDataSource.data = this.selectedModuleData;
    }
  }
  ngAfterViewInit() {
    this.moduleDataSource.paginator = this.modulePaginator;
  }
  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }
  CloseModal() {
    this.dialogRef.close(false);
  }
  SaveData() {
    const data = this.sortedModuleList.map((item) => ({
      PARAMETER_GUID: item.PARAMETER_GUID,
    }));
    this.api.PostDataService("sp/update-order", { data }).subscribe(
      (res: object) => {
        if (res["Status"] === 200) {
          this.dialogRef.close(true);
          this.common.ShowMessage(
            "System parameter saved successfully",
            "notify-success",
            3000
          );
        } else {
          // this.ErrorMessage = res['message'];
          this.common.ShowMessage(res["Message"], "notify-error", 6000);
        }
      },
      (error) => {
        this.common.ShowMessage(error["Message"], "notify-error", 6000);
      }
    );
  }
  handleMoveUp(PARAMETER_GUID: string) {
    const index = this.selectedModuleData.findIndex((object) => {
      return object.PARAMETER_GUID === PARAMETER_GUID;
    });
    if (index > 0) {
      this.sortedModuleList = this.moveArrayItemToNewIndex(
        this.selectedModuleData,
        index,
        index - 1
      );
      this.moduleDataSource.data = this.sortedModuleList;
    }
  }
  handleMoveDown(PARAMETER_GUID: string) {
    const index = this.selectedModuleData.findIndex((object) => {
      return object.PARAMETER_GUID === PARAMETER_GUID;
    });
    console.log(index, this.selectedModuleData.length);
    if (index + 1 < this.selectedModuleData.length) {
      this.sortedModuleList = this.moveArrayItemToNewIndex(
        this.selectedModuleData,
        index,
        index + 1
      );
      this.moduleDataSource.data = this.sortedModuleList;
    }
  }
  moveArrayItemToNewIndex(
    arr: Array<any>,
    old_index: number,
    new_index: number
  ) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
}
