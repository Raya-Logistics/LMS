import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserswarehousesComponent } from './userswarehouses.component';

describe('UserswarehousesComponent', () => {
  let component: UserswarehousesComponent;
  let fixture: ComponentFixture<UserswarehousesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserswarehousesComponent]
    });
    fixture = TestBed.createComponent(UserswarehousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
