import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositioncolumnComponent } from './positioncolumn.component';

describe('PositioncolumnComponent', () => {
  let component: PositioncolumnComponent;
  let fixture: ComponentFixture<PositioncolumnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositioncolumnComponent]
    });
    fixture = TestBed.createComponent(PositioncolumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
