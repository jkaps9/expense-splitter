import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";

export default function NewExpense() {
  const navigate = useNavigate();
  const location = useLocation();

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      description: "",
      category: "",
      amount: "",
      currency: location.state?.groupDetails.default_currency || "",
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
        .insert({
          group_id: location.state?.groupDetails.id,
          description: values.description,
          category: values.category,
          amount: values.amount,
          currency: values.currency,
          split_type: "equal",
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
        <select
          name="category"
          id="category-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">--Please choose an option--</option>
          <option value="food">Food</option>
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
      </AuthForm>
    </>
  );
}
