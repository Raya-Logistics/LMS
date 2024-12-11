import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoragetypeComponent } from './storagetype.component';

describe('StoragetypeComponent', () => {
  let component: StoragetypeComponent;
  let fixture: ComponentFixture<StoragetypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StoragetypeComponent]
    });
    fixture = TestBed.createComponent(StoragetypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
