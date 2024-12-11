import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AisleComponent } from './aisle.component';

describe('AisleComponent', () => {
  let component: AisleComponent;
  let fixture: ComponentFixture<AisleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AisleComponent]
    });
    fixture = TestBed.createComponent(AisleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
