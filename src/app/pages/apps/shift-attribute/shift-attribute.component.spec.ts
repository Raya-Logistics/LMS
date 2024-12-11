import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftAttributeComponent } from './shift-attribute.component';

describe('ShiftAttributeComponent', () => {
  let component: ShiftAttributeComponent;
  let fixture: ComponentFixture<ShiftAttributeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftAttributeComponent]
    });
    fixture = TestBed.createComponent(ShiftAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
