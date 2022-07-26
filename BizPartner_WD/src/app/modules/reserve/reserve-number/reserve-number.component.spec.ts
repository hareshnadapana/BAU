import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveNumberComponent } from './reserve-number.component';

describe('ReserveNumberComponent', () => {
  let component: ReserveNumberComponent;
  let fixture: ComponentFixture<ReserveNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReserveNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReserveNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
