import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ShareDataService {

    private itemSource = new BehaviorSubject<any>(null);
    currentItem = this.itemSource.asObservable();

    changeCurrentItem(data: object){
        this.itemSource.next(data);
    }

}