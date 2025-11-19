/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SortieModalComponent } from './sortie-modal.component';

describe('SortieModalComponent', () => {
  let component: SortieModalComponent;
  let fixture: ComponentFixture<SortieModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortieModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortieModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
