export interface Goal {
  id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  createdAt: string;
}