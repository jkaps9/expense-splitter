export type SplitType = "Equal" | "Exact" | "Percentage" | "Shares";

export interface SplitMemberState {
  groupMemberId: string;
  displayName: string;
  isActive: boolean;
  included: boolean;
  splitValue: number | null;
  calculatedAmount: number;
}

export interface ExpenseFormState {
  totalAmount: number;
  splitType: SplitType;
  members: SplitMemberState[];
}

interface NotificationSettings {
  email_alerts: boolean;
}

export interface ProfileData {
  display_name: string;
  avatar_url: string | null;
  default_currency: string;
  notification_settings: NotificationSettings;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  default_currency: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  guest_name: string;
  joined_at: string;
  id: string;
}

export interface Split {
  expense_id: string;
  group_member_id: string;
  amount_owed: number;
  split_value: number;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  category: string;
  split_type: string;
  expense_date: string;
  created_at: string;
  splits?: Split[];
}
