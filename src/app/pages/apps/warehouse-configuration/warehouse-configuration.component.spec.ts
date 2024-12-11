import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseConfigurationComponent } from './warehouse-configuration.component';

describe('WarehouseConfigurationComponent', () => {
  let component: WarehouseConfigurationComponent;
  let fixture: ComponentFixture<WarehouseConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WarehouseConfigurationComponent]
    });
    fixture = TestBed.createComponent(WarehouseConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
