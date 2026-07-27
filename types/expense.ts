export type SplitType = "Equal" | "Exact" | "Percentage" | "Shares";

export interface SplitMemberState {
  groupMemberId: string;
  displayName: string;
  isActive: boolean;
  splitValue: number | null;
  calculatedAmount: number;
}

export interface ExpenseFormState {
  totalAmount: number;
  splitType: SplitType;
  members: SplitMemberState[];
}
