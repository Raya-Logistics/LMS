import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDetailsTypeComponent } from './stock-details-type.component';

describe('StockDetailsTypeComponent', () => {
  let component: StockDetailsTypeComponent;
  let fixture: ComponentFixture<StockDetailsTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockDetailsTypeComponent]
    });
    fixture = TestBed.createComponent(StockDetailsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
