import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTargetingPopupComponent } from './campaign-targeting-popup.component';

describe('CampaignTargetingPopupComponent', () => {
  let component: CampaignTargetingPopupComponent;
  let fixture: ComponentFixture<CampaignTargetingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignTargetingPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTargetingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
