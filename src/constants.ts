export const SPLIT_TYPES = ["Equal", "Exact", "Percentage", "Shares"];

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

export const CURRENCIES = [
  { iso_code: "USD", symbol: "$" },
  { iso_code: "EUR", symbol: "€" },
  { iso_code: "JPY", symbol: "¥" },
  { iso_code: "GBP", symbol: "£" },
  { iso_code: "CNY", symbol: "¥" },
  { iso_code: "AUD", symbol: "$" },
  { iso_code: "CAD", symbol: "$" },
  { iso_code: "HKD", symbol: "$" },
  { iso_code: "SGD", symbol: "$" },
];

export type Currencies = (typeof CURRENCIES)[number];
