import { Link } from "react-router";
import FormInput from "@/components/FormInput";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";

const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}/dashboard`;

export default function ResetPassword() {
  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: "" },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.email) newErrors.email = "Can't be empty";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: redirectUrl,
        },
      );

      if (error) {
        alert(error.message);
      } else {
        alert(
          "If an account with that email address was found you wil receive a link to reset your password.",
        );
      }
    },
  });

  const resetFooter = (
    <>
      <p>
        Remembered your password?{" "}
        <Link to="../login" className="accent-text">
          Login
        </Link>
      </p>
    </>
  );

  return (
    <AuthForm
      title="Reset Password"
      description=""
      submitText="Reset Password"
      onSubmit={handleSubmit}
      footerContent={resetFooter}
    >
      <FormInput
        id="email"
        name="email"
        label="Email Address"
        type="email"
        placeholder="name@email.com"
        value={formData.email}
        onChange={handleChange}
        errorMessage={errors.email}
        required
        autoComplete="email"
      />
    </AuthForm>
  );
}
