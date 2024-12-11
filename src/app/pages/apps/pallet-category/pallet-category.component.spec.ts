import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletCategoryComponent } from './pallet-category.component';

describe('PalletCategoryComponent', () => {
  let component: PalletCategoryComponent;
  let fixture: ComponentFixture<PalletCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PalletCategoryComponent]
    });
    fixture = TestBed.createComponent(PalletCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
