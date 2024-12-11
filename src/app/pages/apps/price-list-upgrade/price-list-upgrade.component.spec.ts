import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruceListUpgradeComponent } from './price-list-upgrade.component';

describe('PruceListUpgradeComponent', () => {
  let component: PruceListUpgradeComponent;
  let fixture: ComponentFixture<PruceListUpgradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PruceListUpgradeComponent]
    });
    fixture = TestBed.createComponent(PruceListUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
