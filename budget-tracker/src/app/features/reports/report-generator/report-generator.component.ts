import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';

export interface ReportData {
  generatedAt:    string;
  periodLabel:    string;
  totalIncome:    number;
  totalExpenses:  number;
  balance:        number;
  savingsRate:    number;
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  incomeBySource:     { category: string; amount: number; percentage: number }[];
  budgetVariances: {
    category: string; month: string;
    limit: number; spent: number; variance: number; status: string;
  }[];
  goalProgresses: {
    title: string; targetAmount: number; savedAmount: number;
    deadline: string; percentage: number; isCompleted: boolean; remaining: number;
  }[];
  totalSaved:          number;
  totalSavingsTarget:  number;
  overallSavingsRate:  number;
  completedGoals:      number;
}

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls:   ['./report-generator.component.css'],
  standalone: false
})
export class ReportGeneratorComponent implements OnChanges {

  @Input() data!: ReportData;
  @Input() userName = 'User';

  isOpen   = false;
  isPrinting = false;

  // Derived bar max — used to scale bars relative to largest value
  maxExpense  = 0;
  maxIncome   = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.maxExpense = this.data.expensesByCategory.reduce(
        (m, i) => Math.max(m, i.amount), 0);
      this.maxIncome  = this.data.incomeBySource.reduce(
        (m, i) => Math.max(m, i.amount), 0);
    }
  }

  open():  void { this.isOpen = true; }
  close(): void { this.isOpen = false; }

  printReport(): void {
    this.isPrinting = true;
    // Give Angular a tick to apply isPrinting class before printing
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
    }, 150);
  }

  getVarianceClass(status: string): string {
    if (status === 'over')    return 'status-over';
    if (status === 'warning') return 'status-warn';
    return 'status-ok';
  }

  getVarianceLabel(status: string): string {
    if (status === 'over')    return 'Over Budget';
    if (status === 'warning') return 'Near Limit';
    return 'Under Budget';
  }

  getGoalBarColor(pct: number): string {
    if (pct >= 100) return '#16a34a';
    if (pct >= 75)  return '#6366f1';
    if (pct >= 50)  return '#d97706';
    return '#ef4444';
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 2
    }).format(val);
  }
}