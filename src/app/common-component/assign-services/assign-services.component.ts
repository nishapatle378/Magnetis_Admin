import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListColumn } from '../../../@fury/shared/list/list-column.model';
import { fadeInRightAnimation } from '../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../@fury/animations/fade-in-up.animation';

// service
import { ApiService } from '../../providers/services/ApiService';
import { CommonService } from '../../providers/services/CommonService';

@Component({
  selector: 'assign-services',
  templateUrl: './assign-services.component.html',
  styleUrls: ['./assign-services.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class AssignServices implements OnInit {

  //  @Input()
  columns = [
    { name: 'checkbox', property: 'checkbox', visible: true },
    { name: 'priorityCode', property: 'priorityCode', visible: true },
    { name: 'priorityName', property: 'priorityName', visible: true },
  ];
  pageSize = 10000;
  dataSource: MatTableDataSource<[]> | null;
  MasterList: Array<object> = [];

  selectedService: Array<object> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ids: number[] = [];

  constructor(
    private dialogRef: MatDialogRef<AssignServices>,
    private dialog: MatDialog, private api: ApiService, private snackbar: MatSnackBar, private common: CommonService) {
  
  }

  get visibleColumns() {
    return this.columns.filter(column => column.visible).map(column => column.property);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource();
    this.GetMaster();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  CloseModal(){
    this.dialogRef.close(null);
  }

  GetMaster(){
    this.api.GetDataService('service/all').subscribe( res => {
      if(res['code'] === 2000 && res['message'] === "SUCESS") {
        this.MasterList = this.common.ParseServiceData(res['result']);
        this.MasterList.forEach((s: object) => {
          this.preSelectService(s);
        })
      }else{
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }

  onFilterChange(value) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
    // this.dataSource.filter = value.trim().toLowerCase();
  }

  parentServiceSelected(service: object){
    if(service['children']){
      if(service['children'].length > 0){
        service['children'].forEach((child: object) => {
          child['selected'] = service['selected'];
          this.parentServiceSelected(child);
        })
      }
    }
  }

  preSelectService(service: object){
    service['selected'] = this.ids.includes(service['serviceID']) ? true : false;
    if(service['children']){
      service['children'].forEach((child: object) => {
        this.preSelectService(child);
      })
    }
  }

  parseSelectedService(service: object){
    if(service['selected']){
      this.selectedService.push(service);
    }
    if(service['children']){
      service['children'].forEach((child: object) => {
        this.parseSelectedService(child);
      })
    }
  }

  Save(){
    // var data = this.MasterList;
    // var checked = data.filter((d: object) => d['selected']);
    // this.dialogRef.close(checked ? checked : null);
    this.selectedService = [];
    this.MasterList.forEach((s: object) => {
      this.parseSelectedService(s);
    });
    this.dialogRef.close(this.selectedService);
  }

}