import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnreserveNumberComponent } from './unreserve-number.component';

describe('UnreserveNumberComponent', () => {
  let component: UnreserveNumberComponent;
  let fixture: ComponentFixture<UnreserveNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnreserveNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnreserveNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
