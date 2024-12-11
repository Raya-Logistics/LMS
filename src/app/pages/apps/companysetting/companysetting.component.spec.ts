import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanysettingComponent } from './companysetting.component';

describe('CompanysettingComponent', () => {
  let component: CompanysettingComponent;
  let fixture: ComponentFixture<CompanysettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanysettingComponent]
    });
    fixture = TestBed.createComponent(CompanysettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
