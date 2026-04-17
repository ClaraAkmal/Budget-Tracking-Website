import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetFormDialog } from './budget-form-dialog';

describe('BudgetFormDialog', () => {
  let component: BudgetFormDialog;
  let fixture: ComponentFixture<BudgetFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BudgetFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
