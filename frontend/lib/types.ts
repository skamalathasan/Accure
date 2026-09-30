export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // "YYYY-MM-DD"
  created_at: string;
}

// What we send when creating or updating a transaction
export type TransactionInput = Omit<Transaction, "id" | "created_at">;

export interface MonthlyTotal {
  month: string; // "YYYY-MM"
  income: number;
  expenses: number;
}

export interface Summary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  monthly: MonthlyTotal[];
}
