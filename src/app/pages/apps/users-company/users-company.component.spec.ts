import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersCompanyComponent } from './users-company.component';

describe('UsersCompanyComponent', () => {
  let component: UsersCompanyComponent;
  let fixture: ComponentFixture<UsersCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersCompanyComponent]
    });
    fixture = TestBed.createComponent(UsersCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
