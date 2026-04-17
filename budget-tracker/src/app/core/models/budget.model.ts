export interface Budget {
  id?: string;
  userId: string;
  category: string;
  limit: number;
  month: string;        // format: 'YYYY-MM'
  spent: number;
  createdAt: string;
}