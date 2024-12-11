import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevexpressComponent } from './devexpress.component';

describe('DevexpressComponent', () => {
  let component: DevexpressComponent;
  let fixture: ComponentFixture<DevexpressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevexpressComponent]
    });
    fixture = TestBed.createComponent(DevexpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
