import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitOfMeasureComponent } from './unit-of-measure.component';

describe('UnitOfMeasureComponent', () => {
  let component: UnitOfMeasureComponent;
  let fixture: ComponentFixture<UnitOfMeasureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitOfMeasureComponent]
    });
    fixture = TestBed.createComponent(UnitOfMeasureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
