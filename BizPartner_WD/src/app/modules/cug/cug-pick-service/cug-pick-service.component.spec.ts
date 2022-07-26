import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CugPickServiceComponent } from './cug-pick-service.component';

describe('CugPickServiceComponent', () => {
  let component: CugPickServiceComponent;
  let fixture: ComponentFixture<CugPickServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CugPickServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CugPickServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
