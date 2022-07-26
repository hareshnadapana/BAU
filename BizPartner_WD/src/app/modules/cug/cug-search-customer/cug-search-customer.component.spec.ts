import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CugSearchCustomerComponent } from './cug-search-customer.component';

describe('CugSearchCustomerComponent', () => {
  let component: CugSearchCustomerComponent;
  let fixture: ComponentFixture<CugSearchCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CugSearchCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CugSearchCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
