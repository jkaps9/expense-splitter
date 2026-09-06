import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "@/constants";

export default function NewExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      amount: "",
      date: today,
      description: "",
      category: "",
      currency: location.state?.groupDetails.default_currency || "",
      splitType: "",
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
      const { error } = await supabase
        .from("expenses")
        .insert({
          group_id: location.state?.groupDetails.id,
          description: values.description,
          category: values.category,
          amount: values.amount,
          expense_date: values.date,
          currency: values.currency,
          split_type: values.splitType,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
      } else {
        navigate(
          `${import.meta.env.BASE_URL}/groups/${location.state?.groupDetails.id}`,
        );
      }
    },
  });

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
      </AuthForm>
    </>
  );
}
