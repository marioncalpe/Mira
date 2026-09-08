import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivationBannerComponent } from './motivation-banner.component';

describe('MotivationBannerComponent', () => {
  let component: MotivationBannerComponent;
  let fixture: ComponentFixture<MotivationBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotivationBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotivationBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});