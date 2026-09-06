import FormInput from "@components/FormInput";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";
import { useNavigate, useLocation } from "react-router";
import AuthForm from "@components/AuthForm";
import { CURRENCIES } from "@/constants";

export default function EditGroup() {
  const location = useLocation();

  const groupDetails = location.state?.groupDetails;

  const navigate = useNavigate();

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: {
      name: groupDetails.name,
      description: groupDetails.description,
      default_currency: groupDetails.default_currency,
    },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.name) newErrors.name = "Can't be empty";
      if (!values.default_currency)
        newErrors.default_currency = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { error } = await supabase
        .from("groups")
        .update({
          name: values.name,
          description: values.description,
          default_currency: values.default_currency,
        })
        .eq("id", groupDetails.id);

      if (error) {
        alert(error.message);
      } else {
        navigate(`${import.meta.env.BASE_URL}/groups/${groupDetails.id}`);
      }
    },
  });

  return (
    <>
      <AuthForm
        title="Edit Group"
        description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint, dicta!"
        onSubmit={handleSubmit}
        submitText="Submit Changes"
      >
        <FormInput
          id="groupName"
          name="name"
          label="Name"
          type="text"
          placeholder="Family Vacation"
          onChange={handleChange}
          errorMessage={errors.name}
          value={formData.name}
          required
        ></FormInput>
        <FormInput
          id="groupDescription"
          name="description"
          label="Description"
          type="text"
          placeholder="Describe the purpose of the group"
          value={formData.description}
          onChange={handleChange}
        ></FormInput>
        <label htmlFor="groupDefaultCurrency">Default Currency</label>
        <select
          name="default_currency"
          id="groupDefaultCurrency"
          value={formData.default_currency}
          onChange={handleChange}
          required
        >
          <option value="">--Please choose an option--</option>
          {CURRENCIES.map((currency) => (
            <option value={currency.iso_code}>
              {currency.symbol} {currency.iso_code}
            </option>
          ))}
        </select>
        <p className="error-message">{errors.default_currency}</p>
      </AuthForm>
      {/* TODO: form fields to add: 
          - name
          - description
          - default_currency
          - Group Members
            - guest_name OR user_id
          - type (bonus - not currently in db)
          - avatar (bonus - not currently in db)
          - settle up day (bonus - not currently in db)
          - simplify group debts? (bonus - not currently db)
      */}
    </>
  );
}
