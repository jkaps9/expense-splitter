import { useNavigate } from "react-router";
import FormInput from "@/components/FormInput";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { password: "", confirmPassword: "" },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.password) newErrors.password = "Can't be blank";
      if (values.password !== values.confirmPassword)
        newErrors.password = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Password has been updated");
        navigate(`${import.meta.env.BASE_URL}/dashboard`);
      }
    },
  });

  return (
    <AuthForm
      title="Update Password"
      description=""
      submitText="Submit"
      onSubmit={handleSubmit}
    >
      <FormInput
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        errorMessage={errors.password}
        required
        minLength={8}
      />
      <FormInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        errorMessage={errors.confirmPassword}
        required
        minLength={8}
      />
    </AuthForm>
  );
}
