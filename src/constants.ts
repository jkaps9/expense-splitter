export const SPLIT_TYPES = ["Equal", "Exact", "Percentage", "Shares"] as const;

export type SplitTypes = (typeof SPLIT_TYPES)[number];
