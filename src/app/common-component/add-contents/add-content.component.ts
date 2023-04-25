import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { fadeInRightAnimation } from '../../../@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from '../../../@fury/animations/fade-in-up.animation';

// service
import { ApiService } from '../../providers/services/ApiService';
import { CommonService } from '../../providers/services/CommonService';

import * as _moment from 'moment';

const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'add-content',
  templateUrl: './add-content.component.html',
  styleUrls: ['./add-content.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class AddContent implements OnInit {

  
  Hours: Array<object> = [];
  MediaList: Array<object> = [];
  Contents: Array<object> = [];

  constructor(
    private dialogRef: MatDialogRef<AddContent>,
    private dialog: MatDialog, private api: ApiService, private snackbar: MatSnackBar, public common: CommonService) {
  
  }

  ngOnInit() {
    this.FetchAllMedia();
  }


  FetchAllMedia(){
    this.api.GetDataService('media/playlist/allcontents').subscribe( res => {
      if(res['code'] === 2000 && res['message'] === "SUCESS") {
        this.MediaList = res['result'].filter((r: object) => r['approved']);
      }else{
        this.common.ShowMessage(res['message'], 'notify-error', 6000);
      }
    }, (error) => {
      this.common.ShowMessage(error['message'], 'notify-error', 6000);
    })
  }

  AddContent(){
    this.Contents.push({
      contentID: '',
      contentType: "",
      contentName: "",
      playSequence: 0,
      contentSize: ''
    });
  }

  RemoveContent(b: object, i: number){
    this.Contents.splice(i, 1);
  }

  CloseModal(){
    this.dialogRef.close(null);
  }

  Save(){
    this.Contents.forEach((c: object) => {
      this.MediaList.forEach((m: object) => {
        if(c['contentID'] == m['contentID']){
          c['contentType'] = m['contentType'];
          c['contentName'] = m['contentName'];
          c['contentSize'] = m['contentSize'];
        }
      })
    });
    this.dialogRef.close(this.Contents);
  }

}