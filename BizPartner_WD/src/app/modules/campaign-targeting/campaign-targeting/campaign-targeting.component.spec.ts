import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTargetingComponent } from './campaign-targeting.component';

describe('CampaignTargetingComponent', () => {
  let component: CampaignTargetingComponent;
  let fixture: ComponentFixture<CampaignTargetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignTargetingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTargetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
