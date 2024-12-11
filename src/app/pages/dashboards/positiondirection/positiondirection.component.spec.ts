import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositiondirectionComponent } from './positiondirection.component';

describe('PositiondirectionComponent', () => {
  let component: PositiondirectionComponent;
  let fixture: ComponentFixture<PositiondirectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositiondirectionComponent]
    });
    fixture = TestBed.createComponent(PositiondirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
