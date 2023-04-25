import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import * as _moment from "moment";

export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY-MM-DD",
  },
  display: {
    dateInput: "DD MMM YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM-YYYY",
  },
};

@Component({
  selector: "fury-custom-date-picker",
  templateUrl: "./custom-date-picker.component.html",
  styleUrls: ["./custom-date-picker.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CustomDatePickerComponent implements OnInit {
  @Output() onValueChangeEvent = new EventEmitter<string>();

  @Input() label: string = "";
  @Input() defaultDate: Date = null;
  defaultValue = new FormControl(this.defaultDate);
  constructor() {}

  ngOnInit(): void {
  }
  ngOnChanges(changes: any): void {
    console.log("value changed", changes);
    if(changes.defaultDate.firstChange){
      console.log("First change", changes.defaultDate.currentValue)
    }
    this.defaultValue = new FormControl(changes.defaultDate.currentValue);
  }
  onValueChange(event: MatDatepickerInputEvent<Date>) {
    this.onValueChangeEvent.emit(event.value.toISOString());
  }
}
