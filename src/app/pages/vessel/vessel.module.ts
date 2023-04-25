import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { VesselRoutingModule } from './vessel.routing.module';

import { ViewAllVesselComponent } from './view-all-vessel/view-all-vessel.component';
import { AddEditVesselComponent } from './add-edit-vessel/add-edit-vessel.component';
import { QuickVesselComponent } from './quick-vessel/quick-vessel.component';

@NgModule({
  imports: [
    CommonModule,
    VesselRoutingModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ],
  declarations: [
    ViewAllVesselComponent,
    AddEditVesselComponent,
    QuickVesselComponent
  ],
  entryComponents: [
    AddEditVesselComponent
  ]
})

export class VesselModule {
}
