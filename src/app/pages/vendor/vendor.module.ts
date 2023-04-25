import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from '../../../@fury/shared/card/card.module';
import { HighlightModule } from '../../../@fury/shared/highlightjs/highlight.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { VendorRoutingModule } from './vendor.routing.module';
import { ViewAllVendorComponent } from './view-all-vendor/view-all-vendor.component';
import { AddEditVendorComponent } from './add-edit-vendor/add-edit-vendor.component';



@NgModule({
  declarations: [ViewAllVendorComponent, AddEditVendorComponent],
  imports: [
    CommonModule,
    VendorRoutingModule,
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
  entryComponents: [
    AddEditVendorComponent
  ]
})
export class VendorModule { }
