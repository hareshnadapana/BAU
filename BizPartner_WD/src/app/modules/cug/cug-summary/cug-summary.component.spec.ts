import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CugSummaryComponent } from './cug-summary.component';

describe('CugSummaryComponent', () => {
  let component: CugSummaryComponent;
  let fixture: ComponentFixture<CugSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CugSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CugSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
