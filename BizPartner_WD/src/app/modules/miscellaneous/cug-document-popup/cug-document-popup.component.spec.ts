import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CugDocumentPopupComponent } from './cug-document-popup.component';

describe('CugDocumentPopupComponent', () => {
  let component: CugDocumentPopupComponent;
  let fixture: ComponentFixture<CugDocumentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CugDocumentPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CugDocumentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
