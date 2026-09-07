import { useState } from "react";
import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "@/constants";
import { SplitMemberState } from "@/types";

interface RouterGroupMember {
  id: string;
  guest_name: string | null;
  users: {
    display_name: string | null;
  } | null;
}

export default function NewExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const groupMembers = location.state?.groupMembers || [];

  const [membersState, setMembersState] = useState<
    (SplitMemberState & { name: string })[]
  >(
    groupMembers.map((m: RouterGroupMember) => ({
      groupMemberId: m.id,
      included: true,
      splitValue: 0,
      name: m.users?.display_name || m.guest_name || "Unknown",
    })),
  );

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      amount: "",
      date: today,
      description: "",
      category: "",
      currency: location.state?.groupDetails.default_currency || "",
      splitType: "",
      payer: "",
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
      return newErrors;
    },
    onSubmit: async (values) => {
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
          paid_by_member_id: values.payer, // Assuming first member paid for now; add a payer dropdown later!
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
        title="Create New Expense"
        description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dicta!"
        onSubmit={handleSubmit}
        submitText="Create"
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
          <option value="">--Please choose an option--</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option value={category.toLowerCase()}>{category}</option>
          ))}
        </select>
        <FormInput
          id="currency"
          name="currency"
          label="Currency"
          type="text"
          placeholder="USD"
          onChange={handleChange}
          errorMessage={errors.currency}
          value={formData.currency}
          required
        ></FormInput>
        <label htmlFor="splitType-select">Split Type</label>
        <select
          name="splitType"
          id="splitType-select"
          value={formData.splitType}
          onChange={handleChange}
        >
          <option value="">--Please choose an option--</option>
          {SPLIT_TYPES.map((type) => (
            <option value={type.toLowerCase()}>{type}</option>
          ))}
        </select>
        <label htmlFor="payer-select">Payer</label>
        <select
          name="payer"
          id="payer-select"
          value={formData.payer}
          onChange={handleChange}
        >
          <option value="">--Please choose an option--</option>
          {groupMembers.map((member: RouterGroupMember) => (
            <option value={member.id}>
              {member.users?.display_name || member.guest_name || "Unknown"}
            </option>
          ))}
        </select>

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
          </div>
        )}
      </AuthForm>
    </>
  );
}
