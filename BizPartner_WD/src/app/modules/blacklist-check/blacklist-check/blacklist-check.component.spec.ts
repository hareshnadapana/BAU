import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacklistCheckComponent } from './blacklist-check.component';

describe('BlacklistCheckComponent', () => {
  let component: BlacklistCheckComponent;
  let fixture: ComponentFixture<BlacklistCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlacklistCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlacklistCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
