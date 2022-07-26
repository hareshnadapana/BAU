import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { CampaignTargetingComponent } from './campaign-targeting/campaign-targeting.component';
import { CampaignTargetingPopupComponent } from './campaign-targeting-popup/campaign-targeting-popup.component';
import { CampaignTargetingPopupUploadComponent } from './campaign-targeting-popup-upload/campaign-targeting-popup-upload.component';

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
import { DatePipe } from '@angular/common'
import { HttpClientModule } from '@angular/common/http';

const campaignRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'customertargetlist'
  },
  {
    path: 'customertargetlist',
    component: CampaignTargetingComponent
  }
  // {
  //   path: 'campaigntargetingpopup',
  //   component: CampaignTargetingPopupComponent
  // },
  // {
  //   path: 'campaigntargetingpopupupload',
  //   component: CampaignTargetingPopupUploadComponent
  // }
];

@NgModule({
  declarations: [
    CampaignTargetingComponent,
    CampaignTargetingPopupComponent,
    CampaignTargetingPopupUploadComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(campaignRoutes),
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
    MatGridListModule,
    HttpClientModule
  ],
  providers: [DatePipe]
})
export class CampaignTargetingModule { }
