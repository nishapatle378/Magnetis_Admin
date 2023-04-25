import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})

export class CommonService
{

  constructor(
    private snackbar: MatSnackBar
  ) {
  }

  ShowMessage(msg: string, cls: string, duration: number){
    this.snackbar.open(msg, '',{
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [cls]
    });
  }

  AlphaNumericPattern(value:any){
    var pattern = /[0-9A-Za-z ]/;
    var val = '';
    if(value){
      for(var i=0; i<value.length; i++){
        if(value[i].match(pattern)){
          val = val+value[i];
        }
      }
    }
    return val;
  }

  SpecialAlphaNumericPattern(value:any){
    var pattern = /[0-9A-Za-z -]/;
    var val = '';
    if(value){
      for(var i=0; i<value.length; i++){
        if(value[i].match(pattern)){
          val = val+value[i];
        }
      }
    }
    return val;
  }

  NumericPattern(value:any){
    var pattern = /[0-9]/;
    var val = '';
    if(value){
      for(var i=0; i<value.length; i++){
        if(value[i].match(pattern)){
          val = val+value[i];
        }
      }
    }
    return val;
  }

    ParseServiceData(data: Array<object>, ids: number[] = []){

        var ser = JSON.parse(JSON.stringify(data));
        var p = ser.filter((a: object) => a['parentServiceID']);
        var n_p = ser.filter((b: object) => !b['parentServiceID']);

        n_p.forEach((service: object) => {
          service['children'] = [];
          service['expandable'] = true;
          service['selected'] = false;
          p.forEach((child: object) => {
            child['children'] = [];
            child['expandable'] = true;
            child['selected'] = false;
            if(service['serviceID'] == child['parentServiceID']){
              child['parent_connected'] = true;
              service['children'].push(child);
            }
          });
        });

        n_p.forEach((service: object) => {
          service['children'].forEach((child: object) => {
            child['children'] = [];
            child['expandable'] = true;
            child['selected'] = false;
            p.filter((a: object) => !a['parent_connected']).forEach((l2: object) => {
              if(l2['parentServiceID'] == child['serviceID']){
                l2['parent_connected'] = true;
                child['children'].push(l2);
              }
            })
          })
        });

        n_p.forEach((service: object) => {
          service['children'].forEach((child: object) => {
            child['children'].forEach((child_2: object) => {
              child_2['children'] = [];
              child_2['expandable'] = true;
              child_2['selected'] = false;
              p.filter((a: object) => !a['parent_connected']).forEach((l2: object) => {
                if(l2['parentServiceID'] == child_2['serviceID']){
                  l2['parent_connected'] = true;
                  child_2['children'].push(l2);
                }
              })
            })
          })
        })

        n_p.forEach((service: object) => {
          service['children'].forEach((child: object) => {
            child['children'].forEach((child_2: object) => {
              child_2['children'].forEach((child_3: object) => {
                child_3['children'] = [];
                child_3['expandable'] = true;
                child_3['selected'] = false;
                p.filter((a: object) => !a['parent_connected']).forEach((l2: object) => {
                  if(l2['parentServiceID'] == child_3['serviceID']){
                    l2['parent_connected'] = true;
                    child_3['children'].push(l2);
                  }
                })
              })
            })
          })
        });

        n_p.forEach((service: object) => {
          service['children'].forEach((child: object) => {
            child['children'].forEach((child_2: object) => {
              child_2['children'].forEach((child_3: object) => {
                child_3['children'].forEach((child_4: object) => {
                  child_4['children'] = [];
                  child_4['expandable'] = true;
                  child_4['selected'] = false;
                  p.filter((a: object) => !a['parent_connected']).forEach((l2: object) => {
                    if(l2['parentServiceID'] == child_4['serviceID']){
                      l2['parent_connected'] = true;
                      child_4['children'].push(l2);
                    }
                  })
                })
              })
            })
          })
        });

        return n_p;
    }

}
