import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryStatusComponent } from './query-status.component';

describe('QueryStatusComponent', () => {
  let component: QueryStatusComponent;
  let fixture: ComponentFixture<QueryStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
