import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckTypeComponent } from './truck-type.component';

describe('TruckTypeComponent', () => {
  let component: TruckTypeComponent;
  let fixture: ComponentFixture<TruckTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TruckTypeComponent]
    });
    fixture = TestBed.createComponent(TruckTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
