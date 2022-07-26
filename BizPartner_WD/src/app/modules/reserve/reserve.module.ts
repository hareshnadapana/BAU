import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';

import { ReserveNumberComponent } from './reserve-number/reserve-number.component';
import { ReserveSelectionComponent } from './reserve-selection/reserve-selection.component';
import { ReserveStatusComponent } from './reserve-status/reserve-status.component';
import { UnreserveNumberComponent } from './unreserve-number/unreserve-number.component';
import { UnreserveStatusComponent } from './unreserve-status/unreserve-status.component';

import { HttpClientModule } from "@angular/common/http";
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

const reserveRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'reservenumber'
  },
  {
    path: 'reservenumber',
    component: ReserveNumberComponent
  },
  {
    path: 'reserveselection',
    component: ReserveSelectionComponent
  },
  {
    path: 'reservestatus',
    component: ReserveStatusComponent
  },
  {
    path: 'unreservenumber',
    component: UnreserveNumberComponent
  },
  {
    path: 'unreservestatus',
    component: UnreserveStatusComponent
  }
];

@NgModule({
  declarations: [
    ReserveNumberComponent,
    ReserveSelectionComponent,
    UnreserveNumberComponent,
    ReserveStatusComponent,
    UnreserveStatusComponent
  ],
  imports: [
    // ReserveStatusComponent,
    // UnreserveStatusComponent,
    CommonModule,
    RouterModule.forChild(reserveRoutes),
    MatButtonModule,
    // StoreModule.forRoot({ commonStore: commonStoreReducer }),
    HttpClientModule,
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
  ],
  providers: [DatePipe]
})
export class ReserveModule { }
