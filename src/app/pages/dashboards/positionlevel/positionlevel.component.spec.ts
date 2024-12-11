import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionlevelComponent } from './positionlevel.component';

describe('PositionlevelComponent', () => {
  let component: PositionlevelComponent;
  let fixture: ComponentFixture<PositionlevelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionlevelComponent]
    });
    fixture = TestBed.createComponent(PositionlevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
