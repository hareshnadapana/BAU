import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTargetingPopupUploadComponent } from './campaign-targeting-popup-upload.component';

describe('CampaignTargetingPopupUploadComponent', () => {
  let component: CampaignTargetingPopupUploadComponent;
  let fixture: ComponentFixture<CampaignTargetingPopupUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignTargetingPopupUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTargetingPopupUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
