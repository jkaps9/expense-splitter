import { useState } from "react";
import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";
import { EXPENSE_CATEGORIES, SPLIT_TYPES, CURRENCIES } from "@/constants";
import { SplitMemberState, Split } from "@/types";

interface RouterGroupMember {
  id: string;
  guest_name: string | null;
  users: {
    display_name: string | null;
  } | null;
}

export default function ManageExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const groupMembers = location.state?.groupMembers || [];

  const expense = location.state?.expense;
  const existingSplits = location.state?.splits || [];
  const isEditMode = !!expense;

  const [membersState, setMembersState] = useState<
    (SplitMemberState & { name: string })[]
  >(
    groupMembers.map((m: RouterGroupMember) => {
      const memberSplit = existingSplits.find(
        (s: Split) => s.group_member_id === m.id,
      );
      return {
        groupMemberId: m.id,
        included: isEditMode ? !!memberSplit : true,
        splitValue: memberSplit?.split_value || 0,
        name: m.users?.display_name || m.guest_name || "Unknown",
      };
    }),
  );

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      amount: expense?.amount || "",
      date: expense?.expense_date || today,
      description: expense?.description || "",
      category: expense?.category || "",
      currency:
        expense?.currency ||
        location.state?.groupDetails.default_currency ||
        "",
      splitType: expense?.split_type || "",
      payer: expense?.paid_by_member_id || "",
    },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.amount) {
        newErrors.amount = "Can't be empty";
      } else if (values.amount === "" || Number(values.amount) <= 0) {
        newErrors.amount = "Must be greater than zero";
      }
      if (!values.description) newErrors.description = "Can't be empty";
      if (!values.category) newErrors.category = "Can't be blank";
      if (!values.currency) newErrors.currency = "Can't be blank";
      if (!values.splitType) newErrors.splitType = "Can't be blank";
      if (!values.payer) newErrors.payer = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const type = values.splitType.toLowerCase();

      if (type === "exact" && currentSplitTotal !== totalExpenseAmount) {
        return alert(
          "Exact split amounts must match the total expense exactly.",
        );
      }
      if (type === "percentage" && currentSplitTotal !== 100) {
        return alert("Percentages must add up to exactly 100%.");
      }

      if (isEditMode) {
        const { error } = await supabase
          .from("expenses")
          .update({
            id: expense.id,
            group_id: expense.group_id,
            description: values.description,
            category: values.category,
            amount: values.amount,
            currency: values.currency,
            split_type: values.splitType,
          })
          .eq("id", expense.id)
          .select()
          .single();

        if (error) {
          return alert(error.message);
        }

        const { error: deleteError } = await supabase
          .from("splits")
          .delete()
          .eq("expense_id", expense.id);

        if (deleteError) return alert(deleteError.message);

        const splitsToInsert = calculatedMembers
          .filter((m) => m.included && m.calculatedAmount > 0)
          .map((m) => ({
            expense_id: expense.id,
            group_member_id: m.groupMemberId,
            amount_owed: m.calculatedAmount,
            split_value: m.splitValue || null,
          }));

        if (splitsToInsert.length > 0) {
          const { error: splitsError } = await supabase
            .from("splits")
            .insert(splitsToInsert);
          if (splitsError) return alert(splitsError.message);
        }
      } else {
        const { data: expense, error: expenseError } = await supabase
          .from("expenses")
          .insert({
            group_id: location.state?.groupDetails.id,
            description: values.description,
            category: values.category,
            amount: values.amount,
            expense_date: values.date,
            currency: values.currency,
            split_type: values.splitType,
            paid_by_member_id: values.payer,
          })
          .select()
          .single();

        if (expenseError) {
          return alert(expenseError.message);
        }

        const splitsToInsert = calculatedMembers
          .filter((m) => m.included && m.calculatedAmount > 0)
          .map((m) => ({
            expense_id: expense.id,
            group_member_id: m.groupMemberId,
            amount_owed: m.calculatedAmount,
            split_value: m.splitValue || null,
          }));

        if (splitsToInsert.length > 0) {
          const { error: splitsError } = await supabase
            .from("splits")
            .insert(splitsToInsert);
          if (splitsError) return alert(splitsError.message);
        }
      }

      navigate(
        `${import.meta.env.BASE_URL}/groups/${location.state?.groupDetails.id}`,
      );
    },
  });

  const calculatedMembers = membersState.map((m) => {
    let calculatedAmount = 0;
    const totalAmount = Number(formData.amount) || 0;
    const type = formData.splitType.toLowerCase();

    if (type === "equal") {
      const includedCount = membersState.filter((x) => x.included).length;
      calculatedAmount =
        includedCount > 0 && m.included ? totalAmount / includedCount : 0;
    } else if (type === "exact") {
      calculatedAmount = Number(m.splitValue) || 0;
    } else if (type === "percentage") {
      calculatedAmount = (totalAmount * (Number(m.splitValue) || 0)) / 100;
    } else if (type === "shares") {
      const totalShares = membersState.reduce(
        (sum, x) => sum + (Number(x.splitValue) || 0),
        0,
      );
      calculatedAmount =
        totalShares > 0
          ? (totalAmount * (Number(m.splitValue) || 0)) / totalShares
          : 0;
    }

    return { ...m, calculatedAmount: Number(calculatedAmount.toFixed(2)) };
  });

  const currentSplitTotal = calculatedMembers.reduce(
    (sum, m) => sum + (Number(m.splitValue) || 0),
    0,
  );
  const totalExpenseAmount = Number(formData.amount) || 0;

  const handleMemberUpdate = <K extends keyof SplitMemberState>(
    id: string,
    field: K,
    value: SplitMemberState[K],
  ) => {
    setMembersState((prev) =>
      prev.map((m) => (m.groupMemberId === id ? { ...m, [field]: value } : m)),
    );
  };

  return (
    <>
      <AuthForm
        title={isEditMode ? "Edit Expense" : "Create New Expense"}
        description={isEditMode ? "" : ""}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Submit Changes" : "Create"}
      >
        <FormInput
          id="amount"
          name="amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
          errorMessage={errors.amount}
        ></FormInput>
        <FormInput
          id="expenseDate"
          name="date"
          label="Date"
          type="date"
          onChange={handleChange}
          errorMessage={errors.date}
          value={formData.date}
          required
        />
        <FormInput
          id="expenseDescription"
          name="description"
          label="Description"
          type="text"
          placeholder="Dinner at Restaurant"
          onChange={handleChange}
          errorMessage={errors.description}
          value={formData.description}
          required
        ></FormInput>
        <label htmlFor="category-select">Category</label>
        <select
          name="category"
          id="category-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option key="0" value="">
            --Please choose an option--
          </option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category.toLowerCase()} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
        <label htmlFor="currency">Currency</label>
        <select
          name="currency"
          id="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        >
          <option key="0" value="">
            --Please choose an option--
          </option>
          {CURRENCIES.map((currency) => (
            <option key={currency.iso_code} value={currency.iso_code}>
              {currency.symbol} {currency.iso_code}
            </option>
          ))}
        </select>
        <p className="error-message">{errors.currency}</p>

        <label htmlFor="splitType-select">Split Type</label>
        <select
          name="splitType"
          id="splitType-select"
          value={formData.splitType}
          onChange={handleChange}
        >
          <option key="0" value="">
            --Please choose an option--
          </option>
          {SPLIT_TYPES.map((type) => (
            <option key={type.toLowerCase()} value={type.toLowerCase()}>
              {type}
            </option>
          ))}
        </select>
        <p className="error-message">{errors.splitType}</p>

        <label htmlFor="payer-select">Payer</label>
        <select
          name="payer"
          id="payer-select"
          value={formData.payer}
          onChange={handleChange}
        >
          <option key="0" value="">
            --Please choose an option--
          </option>
          {groupMembers.map((member: RouterGroupMember) => (
            <option key={member.id} value={member.id}>
              {member.users?.display_name || member.guest_name || "Unknown"}
            </option>
          ))}
        </select>
        <p className="error-message">{errors.payer}</p>

        {formData.splitType && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Split Breakdown</h4>
            {calculatedMembers.map((member) => (
              <div
                key={member.groupMemberId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {formData.splitType.toLowerCase() === "equal" ? (
                  <input
                    type="checkbox"
                    checked={member.included}
                    onChange={(e) =>
                      handleMemberUpdate(
                        member.groupMemberId,
                        "included",
                        e.target.checked,
                      )
                    }
                  />
                ) : (
                  <input
                    type="number"
                    placeholder={formData.splitType}
                    value={member.splitValue || ""}
                    onChange={(e) =>
                      handleMemberUpdate(
                        member.groupMemberId,
                        "splitValue",
                        Number(e.target.value),
                      )
                    }
                    style={{ width: "80px" }}
                  />
                )}

                <span style={{ flex: 1 }}>{member.name}</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${member.calculatedAmount.toFixed(2)}
                </span>
              </div>
            ))}
            {/* Live Validation Summary */}
            {formData.splitType.toLowerCase() === "exact" && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  backgroundColor:
                    currentSplitTotal === totalExpenseAmount
                      ? "#e6ffed"
                      : "#ffebe9",
                  color:
                    currentSplitTotal === totalExpenseAmount
                      ? "#0a5c36"
                      : "#9e1c23",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Total:</strong>{" "}
                <span style={{ fontFamily: "monospace" }}>
                  ${currentSplitTotal.toFixed(2)}
                </span>{" "}
                /{" "}
                <span style={{ fontFamily: "monospace" }}>
                  ${totalExpenseAmount.toFixed(2)}
                </span>
                {currentSplitTotal !== totalExpenseAmount &&
                  " (Amounts must exactly match the total expense)"}
              </div>
            )}

            {formData.splitType.toLowerCase() === "percentage" && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  backgroundColor:
                    currentSplitTotal === 100 ? "#e6ffed" : "#ffebe9",
                  color: currentSplitTotal === 100 ? "#0a5c36" : "#9e1c23",
                  fontSize: "0.875rem",
                }}
              >
                <strong>Total:</strong> {currentSplitTotal}% / 100%
                {currentSplitTotal !== 100 &&
                  " (Percentages must add up to exactly 100%)"}
              </div>
            )}
          </div>
        )}
      </AuthForm>
    </>
  );
}
