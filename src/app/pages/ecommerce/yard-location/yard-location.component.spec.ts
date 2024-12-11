import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YardLocationComponent } from './yard-location.component';

describe('YardLocationComponent', () => {
  let component: YardLocationComponent;
  let fixture: ComponentFixture<YardLocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YardLocationComponent]
    });
    fixture = TestBed.createComponent(YardLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
