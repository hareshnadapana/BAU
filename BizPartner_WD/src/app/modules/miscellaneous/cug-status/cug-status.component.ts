import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cug-status',
  templateUrl: './cug-status.component.html',
  styleUrls: ['./cug-status.component.scss']
})
export class CugStatusComponent implements OnInit {

  @Input() currentDate: any = new Date();
  confirmCartResponse$: Observable<any>;
  isLoading$: Observable<boolean>
  error$: Observable<string>;
  // statuserr: Status;
  orderId: any = null;
  appointmentRes$: Observable<any>;
  apptDate: any;
  appointmentId: any;

  constructor(private router: Router) {
  }
  ngOnInit(): void {
  }

  redirectTo() {
  }
  ngAfterViewInit() {
  }

  navigateOrder() {
    this.router.navigate(['/home']);
  }
 
}
