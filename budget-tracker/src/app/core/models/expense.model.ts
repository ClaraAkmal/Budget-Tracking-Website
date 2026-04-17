export interface Expense {
  id?: string;
  userId: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
}