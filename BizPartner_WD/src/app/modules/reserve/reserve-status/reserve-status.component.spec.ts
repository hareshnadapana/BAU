import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
// import { StoreModule } from '@ngrx/store';
// import { provideMockStore, MockStore } from '@ngrx/store/testing';
// import { State } from 'src/app/root-store/state';
import { ReserveStatusComponent } from './reserve-status.component';
// import { RootStoreModule, reducers ,metaReducers} from 'src/app/root-store/root-store.module';
import { APP_BASE_HREF, CommonModule, DatePipe } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';;
import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { HttpLoaderFactory } from '../../app.module';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
// import { initialOrderState, initialRootState } from '../../shared/services/URL';
import { MatInputModule } from '@angular/material/input';
// import { ButtonModule } from 'primeng/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { DataViewModule } from 'primeng/dataview';
import { FormBuilder, FormsModule } from '@angular/forms';
// import { ApiService } from '../../shared/services/api.service';
describe('ReserveStatusComponent', () => {
  let component: ReserveStatusComponent;
  let fixture: ComponentFixture<ReserveStatusComponent>;
  let de : DebugElement;
  let el : HTMLElement;
  // let store: MockStore<State>;
  const routes: Routes = [];
  // const initialState =initialRootState;
  // const initialorderStates = initialOrderState;
  // initialorderStates.confirmCartResponse={
  //   "cartInstanceIdentifier": "8974f5e5-9643-4fee-b310-6dfd1abd012e",
  //   "responseStatusList": {
  //     "status": [
  //       {
  //         "statusCode": "0000",
  //         "statusDescription": "Requested Operation Completed Successfully",
  //         "statusType": "Success",
  //         "statusCategory": "Success"
  //       }
  //     ]
  //   },
  //   "responseObject": {
  //     "expectedCompletionDate": "2020-10-13T14:39:50.763+05:30",
  //     "orderDate": "2020-10-13T14:39:50.763+05:30",
  //     "productOrderItem": [
  //       null
  //     ],
  //     "customerRequestedDate": "2020-10-13T14:39:50.757+05:30"
  //   }
  // };
  // initialState.order=initialorderStates;
  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [        
        BrowserModule,
        RouterModule.forRoot([]),
        // ButtonModule,
        MatInputModule,
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule , 
        HttpClientModule,
        MatFormFieldModule,
        FormsModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatBadgeModule,
        MatSelectModule,
        // StoreModule.forRoot(reducers, {metaReducers}),        
        // TranslateModule.forRoot({
        //   loader: {
        //     provide: TranslateLoader,
        //     useFactory: HttpLoaderFactory,
        //     deps: [HttpClient]
        //   }
        // })   
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [ 
        /*RootStoreModule,*/
        // provideMockStore({ initialState }),        
        // TranslateService,
        DatePipe,
        // DataViewModule,
        FormBuilder,
        // ApiService,
        {provide: ActivatedRoute, useValue: routes},
        {provide: APP_BASE_HREF, useValue: '/'}],
        
      declarations: [ ReserveStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    // store = TestBed.get(MockStore); 
    fixture = TestBed.createComponent(ReserveStatusComponent);
    component = fixture.componentInstance;
    // store.setState(initialState);
    // store.refreshState();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have submit Order Page div', () => {
    de = fixture.debugElement.query(By.css('#submitOrderPage'));
    expect(de.nativeElement).toBeTruthy();
  });
  // it('should have submit Order Header div', () => {
  //   de = fixture.debugElement.query(By.css('#submitOrderHeader'));
  //   expect(de.nativeElement).toBeTruthy();
  // });
  // it('should have submit Order Content div', () => {
  //   de = fixture.debugElement.query(By.css('#submitOrderContent'));
  //   expect(de.nativeElement).toBeTruthy();
  // });
  // it('should have submit Order Panel div', () => {
  //   de = fixture.debugElement.query(By.css('#submitOrderPanel'));
  //   expect(de.nativeElement).toBeTruthy();
  // });
  // it('should have submit Order Success div', () => {
  //   de = fixture.debugElement.query(By.css('#submitOrderSuccess'));
  //   expect(de.nativeElement).toBeTruthy();
  // });
  it('should have track Order div', () => {
    de = fixture.debugElement.query(By.css('#trackOrder'));
    expect(de.nativeElement).toBeTruthy();
  });
  // it('should have submit Order Heading `Order Submitted`', () => {
  //   de = fixture.debugElement.query(By.css('#submitOrderHeading'));
  //   expect(de.nativeElement.innerText).toBe('Order Submitted');
  // });
  it('should have order Success Message div', () => {
    de = fixture.debugElement.query(By.css('#orderSuccessMsg'));
    expect(de.nativeElement).toBeTruthy();
  });
  it('should have order Number ', () => {
    de = fixture.debugElement.query(By.css('#orderNumber'));
    expect(de.nativeElement).toBeTruthy();
  });
  it('should have expected Order Completion Date ', () => {
    de = fixture.debugElement.query(By.css('#expectedOrderCompletionDate'));
    expect(de.nativeElement).toBeTruthy();
  });
  it('should have cart Instance Identifier div', () => {
    de = fixture.debugElement.query(By.css('#cartInstanceIdentifier'));
    expect(de.nativeElement).toBeTruthy();
  });
  it('should have expected Completion Date ', () => {
    de = fixture.debugElement.query(By.css('#expectedCompletionDate'));
    expect(de.nativeElement).toBeTruthy();
  });
  // it('should have order Success Message as `Order Submitted Successfully.`', () => {
  //   de = fixture.debugElement.query(By.css('#orderSuccessMsg'));
  //   expect(de.nativeElement.innerText).toBe('Order Submitted Successfully.');
  // });
  it('should have cartInstanceIdentifier tobe', () => {
    de = fixture.debugElement.query(By.css('#cartInstanceIdentifier'));
    expect(de.nativeElement.innerText).toBe('');
  });
  it('should have expected Completion Date to be', () => {
    de = fixture.debugElement.query(By.css('#expectedCompletionDate'));
    expect(de.nativeElement.innerText).toBe('');
  });
  
});
