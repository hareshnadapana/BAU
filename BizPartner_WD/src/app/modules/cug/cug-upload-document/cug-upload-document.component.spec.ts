import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CugUploadDocumentComponent } from './cug-upload-document.component';

describe('CugUploadDocumentComponent', () => {
  let component: CugUploadDocumentComponent;
  let fixture: ComponentFixture<CugUploadDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CugUploadDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CugUploadDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
