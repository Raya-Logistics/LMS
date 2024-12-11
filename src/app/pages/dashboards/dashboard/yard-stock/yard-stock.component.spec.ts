import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YardStockComponent } from './yard-stock.component';

describe('YardStockComponent', () => {
  let component: YardStockComponent;
  let fixture: ComponentFixture<YardStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YardStockComponent]
    });
    fixture = TestBed.createComponent(YardStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
