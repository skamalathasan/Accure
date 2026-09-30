import type { TransactionType } from "./types";

// Keep in sync with backend/categories.py. The backend is the source of truth
// and rejects anything not on this list.
export const CATEGORIES: Record<TransactionType, string[]> = {
  income: ["Sales", "Other Income"],
  expense: ["Rent", "Food", "Transportation", "Software", "Supplies", "Other"],
};
