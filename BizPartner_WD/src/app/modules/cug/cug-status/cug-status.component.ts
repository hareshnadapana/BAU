import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cug-status',
  templateUrl: './cug-status.component.html',
  styleUrls: ['./cug-status.component.scss']
})
export class CugStatusComponent implements OnInit {

  currentDate: any = new Date();

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateOrder() {
    this.router.navigate(['/home']);
  }
}
