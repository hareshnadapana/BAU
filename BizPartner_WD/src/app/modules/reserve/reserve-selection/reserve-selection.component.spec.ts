import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReserveSelectionComponent } from './reserve-selection.component';

describe('ReserveNumberComponent', () => {
  let component: ReserveSelectionComponent;
  let fixture: ComponentFixture<ReserveSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReserveSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReserveSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
