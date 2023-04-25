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

@Component({
  selector: 'language-text',
  templateUrl: './language-text.component.html',
  styleUrls: ['./language-text.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class LanguageText implements OnInit {

  
  langText: Array<object> = [];

  constructor(
    private dialogRef: MatDialogRef<LanguageText>,
    private dialog: MatDialog, private api: ApiService, private snackbar: MatSnackBar) {
  
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    
  }

  AddLang(){
    this.langText.push({
      langKey: '',
      langText: ''
    });
  }

  RemoveLang(b: object, i: number){
    this.langText.splice(i, 1);
  }

  CloseModal(){
    this.dialogRef.close(null);
  }

  Save(){
    this.dialogRef.close(this.langText);
  }

}