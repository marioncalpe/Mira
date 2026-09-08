import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortieModalComponent } from './sortie-modal.component';

describe('SortieModalComponent', () => {
  let component: SortieModalComponent;
  let fixture: ComponentFixture<SortieModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortieModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortieModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});