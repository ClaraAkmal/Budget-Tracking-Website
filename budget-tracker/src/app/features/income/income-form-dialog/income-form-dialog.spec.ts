import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeFormDialog } from './income-form-dialog';

describe('IncomeFormDialog', () => {
  let component: IncomeFormDialog;
  let fixture: ComponentFixture<IncomeFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
