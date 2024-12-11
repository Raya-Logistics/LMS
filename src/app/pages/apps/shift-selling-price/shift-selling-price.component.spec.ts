import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSellingPriceComponent } from './shift-selling-price.component';

describe('ShiftSellingPriceComponent', () => {
  let component: ShiftSellingPriceComponent;
  let fixture: ComponentFixture<ShiftSellingPriceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftSellingPriceComponent]
    });
    fixture = TestBed.createComponent(ShiftSellingPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
