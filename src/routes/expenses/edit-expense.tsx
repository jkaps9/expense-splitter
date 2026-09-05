import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from "@/constants";

export default function EditExpense() {
  const navigate = useNavigate();
  const location = useLocation();

  const expense = location.state?.expense;

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      splitType: expense.split_type,
    },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.description) newErrors.description = "Can't be empty";
      if (!values.category) newErrors.category = "Can't be blank";
      if (!values.currency) newErrors.currency = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { error } = await supabase
        .from("expenses")
        .upsert({
          id: expense.id,
          group_id: expense.group_id,
          description: values.description,
          category: values.category,
          amount: values.amount,
          currency: values.currency,
          split_type: values.splitType,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
      } else {
        navigate(`${import.meta.env.BASE_URL}/groups/${expense.group_id}`);
      }
    },
  });

  return (
    <>
      <AuthForm
        title="Update Expense"
        description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dicta!"
        onSubmit={handleSubmit}
        submitText="Update"
      >
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
          id="amount"
          name="amount"
          label="Amount"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={handleChange}
        ></FormInput>
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
