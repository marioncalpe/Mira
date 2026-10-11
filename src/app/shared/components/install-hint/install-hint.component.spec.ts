import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallHintComponent } from './install-hint.component';

describe('InstallHintComponent', () => {
  let component: InstallHintComponent;
  let fixture: ComponentFixture<InstallHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallHintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
