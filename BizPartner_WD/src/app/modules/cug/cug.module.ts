import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
// import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { CugDocumentPopupComponent } from './cug-document-popup/cug-document-popup.component';
import { CugPickServiceComponent } from './cug-pick-service/cug-pick-service.component';
import { CugSearchCustomerComponent } from './cug-search-customer/cug-search-customer.component';
import { CugStatusComponent } from './cug-status/cug-status.component';
import { CugSummaryComponent } from './cug-summary/cug-summary.component';
import { CugUploadDocumentComponent } from './cug-upload-document/cug-upload-document.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule, DateAdapter } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';

// import { StoreModule } from '@ngrx/store';
// import { commonStoreReducer } from './root-store.reducer';


const cugRoutes: Route[] = [
  {
    path: 'cugdocumentpopup',
    component: CugDocumentPopupComponent
  }, {
    path: 'cugpickservice',
    component: CugPickServiceComponent
  },
  {
    path: 'cugsearchcustomer',
    component: CugSearchCustomerComponent
  },
  {
    path: 'cugstatus',
    component: CugStatusComponent
  },
  {
    path: 'cugsummary',
    component: CugSummaryComponent
  },
  {
    path: 'cuguploaddocument',
    component: CugUploadDocumentComponent
  }
];

@NgModule({
  declarations: [
    CugDocumentPopupComponent,
    CugPickServiceComponent,
    CugSearchCustomerComponent,
    CugStatusComponent,
    CugSummaryComponent,
    CugUploadDocumentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(cugRoutes),
    MatButtonModule,
    // StoreModule.forRoot({ commonStore: commonStoreReducer }),
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatBadgeModule,
    MatTabsModule,
    MatChipsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    MatToolbarModule,
    MatChipsModule,
    MatGridListModule
  ]
})
export class CugModule { }









