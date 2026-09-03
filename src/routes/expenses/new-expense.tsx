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
      name: "",
      amount: "",
      currency: location.state?.default_currency || "",
    },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.name) newErrors.name = "Can't be empty";
      if (!values.currency) newErrors.currency = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { data, error } = await supabase
        .from("groups")
        .insert({
          name: values.name,
          amount: values.amount,
          currency: values.currency,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
      } else {
        navigate(`${import.meta.env.BASE_URL}/groups/${data.id}`);
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
          id="expenseName"
          name="name"
          label="Name"
          type="text"
          placeholder="Dinner at [Restaurant Name]"
          onChange={handleChange}
          errorMessage={errors.name}
          value={formData.name}
          required
        ></FormInput>
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
