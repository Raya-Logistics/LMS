import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyoptionComponent } from './companyoption.component';

describe('CompanyoptionComponent', () => {
  let component: CompanyoptionComponent;
  let fixture: ComponentFixture<CompanyoptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyoptionComponent]
    });
    fixture = TestBed.createComponent(CompanyoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
