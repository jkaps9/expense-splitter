// app/dashboard/groups/[id]/expenses/new/ExpenseForm.tsx
"use client";

import { useEffect, useState } from "react";
import type {
  ExpenseFormState,
  SplitType,
  SplitMemberState,
} from "@/types/expense";

interface ExpenseFormProps {
  groupId: string;
  groupMembers: { id: string; display_name: string }[];
}

const SPLIT_TYPES: SplitType[] = ["Equal", "Exact", "Percentage", "Shares"];

export default function ExpenseForm({
  groupId,
  groupMembers,
}: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [payerId, setPayerId] = useState<string>(groupMembers?.[0]?.id || "");

  const [formState, setFormState] = useState<ExpenseFormState>({
    totalAmount: 0,
    splitType: "Equal",
    members: (groupMembers || []).map((member) => ({
      groupMemberId: member.id,
      displayName: member.display_name,
      isActive: true,
      splitValue: null,
      calculatedAmount: 0,
    })),
  });

  useEffect(() => {
    setFormState((prev) => {
      const updatedMembers = [...prev.members];

      if (prev.splitType === "Equal") {
        const activeCount = updatedMembers.filter((m) => m.isActive).length;
        const splitAmount =
          activeCount > 0 ? prev.totalAmount / activeCount : 0;

        updatedMembers.forEach((m) => {
          m.calculatedAmount = m.isActive ? Number(splitAmount.toFixed(2)) : 0;
        });
      }
      // Note: Add the specific math for Exact, Percentage, and Shares here

      return { ...prev, members: updatedMembers };
    });
  }, [formState.totalAmount, formState.splitType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you will eventually pass the state to your Server Action
    console.log("Submitting:", { description, amount, payerId, formState });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner at Mario's"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount || ""}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setAmount(val);
            setFormState((prev) => ({ ...prev, totalAmount: val }));
          }}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="currency">Currency</label>
        <select name="currency" id="currency">
          <option value="USD" selected>
            USD ($)
          </option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="CAD">CAD ($)</option>
        </select>
      </div>
      {/* TODO: get exchange rate */}
      <div className="input-group">
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          placeholder="Category"
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="split_type">Split Type</label>
        <select name="split_type" id="split_type"></select>
      </div>
    </form>
  );
}
