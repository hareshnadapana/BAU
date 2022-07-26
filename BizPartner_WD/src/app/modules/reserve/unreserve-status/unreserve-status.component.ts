import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as CommonStoreSelectors from 'app/root-store.selectors';

@Component({
  selector: 'app-unreserve-status',
  templateUrl: './unreserve-status.component.html',
  styleUrls: ['./unreserve-status.component.scss']
})
export class UnreserveStatusComponent implements OnInit {

  @Input() currentDate: any = new Date();
  confirmCartResponse$: Observable<any>;
  isLoading$: Observable<boolean>
  error$: Observable<string>;
  // statuserr: Status;
  orderId: any = null;
  appointmentRes$: Observable<any>;
  apptDate: any;
  appointmentId: any;
  isSuccess: boolean;

  constructor(
    private store: Store,
    private router: Router, 
    ) {
  }
  
  ngOnInit(): void {
    this.store.select(CommonStoreSelectors.unreserveStatus).subscribe(result => {
      console.log("Result unreserveStatus DD :", result)
      this.isSuccess = result;
    })
  }

  redirectTo() {
  }
  ngAfterViewInit() {
  }
 
}
