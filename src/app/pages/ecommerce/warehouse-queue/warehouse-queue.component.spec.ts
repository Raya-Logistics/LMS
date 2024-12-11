import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseQueueComponent } from './warehouse-queue.component';

describe('WarehouseQueueComponent', () => {
  let component: WarehouseQueueComponent;
  let fixture: ComponentFixture<WarehouseQueueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseQueueComponent]
    });
    fixture = TestBed.createComponent(WarehouseQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
