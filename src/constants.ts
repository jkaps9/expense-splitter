export const SPLIT_TYPES = ["Equal", "Exact", "Percentage", "Shares"] as const;

export type SplitTypes = (typeof SPLIT_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Accommodation",
  "Housing",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Groceries",
  "Other",
];

export type ExpenseCategories = (typeof EXPENSE_CATEGORIES)[number];
