import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatesHandlerComponent } from './gates-handler.component';

describe('GatesHandlerComponent', () => {
  let component: GatesHandlerComponent;
  let fixture: ComponentFixture<GatesHandlerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GatesHandlerComponent]
    });
    fixture = TestBed.createComponent(GatesHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
