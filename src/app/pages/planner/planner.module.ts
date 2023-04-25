import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule,
} from "@angular-material-components/datetime-picker";
import { ListModule } from "../../../@fury/shared/list/list.module";
import { BreadcrumbsModule } from "../../../@fury/shared/breadcrumbs/breadcrumbs.module";
import { FuryCardModule } from "../../../@fury/shared/card/card.module";
import { HighlightModule } from "../../../@fury/shared/highlightjs/highlight.module";
import { MaterialModule } from "../../../@fury/shared/material-components.module";
import { FurySharedModule } from "../../../@fury/fury-shared.module";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

import { PlannerRoutingModule } from "./planner.routing.module";

import { ViewAllPlannerComponent } from "./view-all-planner/view-all-planner.component";
import { AddEditPlannerComponent } from "./add-edit-planner/add-edit-planner.component";
import { AgentScreenComponent } from "./agent-screen/agent-screen.component";
import { CrewHandleingPopupComponent } from "./crew-handleing-popup/crew-handleing-popup.component";
import { BoatsPopupComponent } from "./boats-popup/boats-popup.component";
import { PlannerDetailsComponent } from "./planner-details/planner-details.component";
import { ViewAllBoatLogComponent } from "./view-all-boat-log/view-all-boat-log.component";
// import { PlannerServiceForBoatComponent } from "./planner-service-for-boat---remove/planner-service-for-boat.component";
import { ViewAllCrewHandelingComponent } from "./view-all-crew-handeling/view-all-crew-handeling.component";
// import { PlannerServiceForCrewComponent } from "./planner-service-for-crew---remove/planner-service-for-crew.component";
import { CrewUpdateComponent } from "./crew-update/crew-update.component";
import { CustomDatePickerComponent } from "./custom-date-picker/custom-date-picker.component";
import { AddNewServiceComponent } from "./add-new-service/add-new-service.component";
import { UpdateServiceStatusComponent } from "./update-service-status/update-service-status.component";
import { TransportIndexComponent } from "./transport-index/transport-index.component";

@NgModule({
  imports: [
    CommonModule,
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
  declarations: [
    ViewAllPlannerComponent,
    AddEditPlannerComponent,
    AgentScreenComponent,
    CrewHandleingPopupComponent,
    BoatsPopupComponent,
    PlannerDetailsComponent,
    ViewAllBoatLogComponent,
    // PlannerServiceForBoatComponent,
    ViewAllCrewHandelingComponent,
    TransportIndexComponent,
    // PlannerServiceForCrewComponent,
    CrewUpdateComponent,
    CustomDatePickerComponent,
    AddNewServiceComponent,
    UpdateServiceStatusComponent,
  ],
  entryComponents: [AddEditPlannerComponent],
})
export class PlannerModule {}
