import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as CommonStoreSelectors from 'app/root-store.selectors';

@Component({
  selector: 'app-reserve-status',
  templateUrl: './reserve-status.component.html',
  styleUrls: ['./reserve-status.component.scss']
})
export class ReserveStatusComponent implements OnInit {

  currentDate: any = new Date();
  confirmCartResponse$: Observable<any>;
  isLoading$: Observable<boolean>
  error$: Observable<string>;
  // statuserr: Status;
  orderId: any = null;
  appointmentRes$: Observable<any>;
  apptDate: any;
  appointmentId: any;
  statusDisplay: any;
  statusDisplay2: any;
  statusDisplay3: any;
  isSuccess: boolean;

  constructor(
    private store: Store,
    private router: Router,
    ) {
  }
  ngOnInit(): void {
    this.store.select(CommonStoreSelectors.reserveStatus).subscribe(result => {
      console.log("Result reserveStatus DD :", result)
      this.isSuccess = result;
    })
  }

  redirectTo() {
  }
  ngAfterViewInit() {
  }
 
}
