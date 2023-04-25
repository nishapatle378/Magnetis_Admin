import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListModule } from '../../@fury/shared/list/list.module';
import { BreadcrumbsModule } from '../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { FuryCardModule } from '../../@fury/shared/card/card.module';
import { HighlightModule } from '../../@fury/shared/highlightjs/highlight.module';
import { MaterialModule } from '../../@fury/shared/material-components.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { FurySharedModule } from '../../@fury/fury-shared.module';

import { ViewTerminals } from './view-terminals/view-terminals.component';
import { LanguageText } from './language-text/language-text.component';
import { PrioritySegment } from './priority-segment/priority-segment.component';
import { AssignLanguages } from './assign-languages/assign-languages.component';
import { AssignPriority } from './assign-priority/assign-priority.component';
import { AssignCustomerType } from './assign-customer-type/assign-customer-type.component';
import { AssignServices } from './assign-services/assign-services.component';
import { ServiceWorkingHours } from './service-hours/service-hours.component';
import { AssignBranch } from './assign-branch/assign-branch.component';
import { AddContent } from './add-contents/add-content.component';


import { StatusChangeConfirmation } from './status-change-confirmation/status-change-confirmation.component';
import { ModificationInfoComponent } from './modification-info/modification-info.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMatSelectSearchModule,

    // Core
    ListModule,
    HighlightModule,
    FuryCardModule,
    BreadcrumbsModule
  ],
  declarations: [
    ViewTerminals,
    LanguageText,
    PrioritySegment,
    AssignLanguages,
    AssignPriority,
    AssignCustomerType,
    AssignServices,
    ServiceWorkingHours,
    AssignBranch,
    AddContent,
    StatusChangeConfirmation,
    ModificationInfoComponent,
  ],
  entryComponents: [
    ViewTerminals,
    LanguageText,
    PrioritySegment,
    AssignLanguages,
    AssignPriority,
    AssignCustomerType,
    AssignServices,
    ServiceWorkingHours,
    AssignBranch,
    AddContent,
    StatusChangeConfirmation,
    ModificationInfoComponent
  ]
})
export class CommonComponentModule {
    
}

