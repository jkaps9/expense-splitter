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
