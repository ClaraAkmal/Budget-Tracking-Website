export interface Income {
  id?: string;
  userId: string;
  source: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  createdAt: string;
}