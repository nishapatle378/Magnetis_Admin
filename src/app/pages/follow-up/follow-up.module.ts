import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FollowUpRoutingModule } from "./follow-up-routing.module";
import { FollowUpListComponent } from "./follow-up-list/follow-up-list.component";
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
} from "@angular-material-components/datetime-picker";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { FurySharedModule } from "src/@fury/fury-shared.module";
import { BreadcrumbsModule } from "src/@fury/shared/breadcrumbs/breadcrumbs.module";
import { FuryCardModule } from "src/@fury/shared/card/card.module";
import { HighlightModule } from "src/@fury/shared/highlightjs/highlight.module";
import { ListModule } from "src/@fury/shared/list/list.module";
import { MaterialModule } from "src/@fury/shared/material-components.module";
import { PlannerRoutingModule } from "../planner/planner.routing.module";
import { UpdateFollowupComponent } from './update-followup/update-followup.component';

@NgModule({
  declarations: [FollowUpListComponent, UpdateFollowupComponent],
  imports: [
    CommonModule,
    FollowUpRoutingModule,
    PlannerRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule,
  ],
})
export class FollowUpModule {}
