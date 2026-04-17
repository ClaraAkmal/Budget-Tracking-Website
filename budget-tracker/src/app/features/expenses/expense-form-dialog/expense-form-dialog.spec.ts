import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseFormDialog } from './expense-form-dialog';

describe('ExpenseFormDialog', () => {
  let component: ExpenseFormDialog;
  let fixture: ComponentFixture<ExpenseFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpenseFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
