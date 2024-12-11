import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyConfigurationComponent } from './company-configuration.component';

describe('CompanyConfigurationComponent', () => {
  let component: CompanyConfigurationComponent;
  let fixture: ComponentFixture<CompanyConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompanyConfigurationComponent]
    });
    fixture = TestBed.createComponent(CompanyConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
