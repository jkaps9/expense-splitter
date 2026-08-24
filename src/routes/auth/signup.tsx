import { Link } from "react-router";
import FormInput from "@/components/FormInput";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";

const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}/dashboard`;

export default function SignUp() {
  const { formData, setFormData, errors, handleChange, handleSubmit } = useForm(
    {
      initialValues: { email: "", password: "", confirmPassword: "" },
      validate: (values) => {
        const newErrors: Partial<Record<keyof typeof values, string>> = {};
        if (!values.email) newErrors.email = "Can't be empty";
        if (!values.password) newErrors.password = "Can't be blank";
        if (values.password !== values.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        return newErrors;
      },
      onSubmit: async (values) => {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          console.error("Sign up error:", error);
          alert(error.message);
        } else {
          setFormData(() => ({ email: "", password: "", confirmPassword: "" }));
          alert(
            "If you do not have an account, a verification link has been sent. If you already have an account please login.",
          );
        }
      },
    },
  );

  const signUpFooter = (
    <>
      <p>
        Already have an account?{" "}
        <Link to="../login" className="accent-text">
          Login
        </Link>
      </p>
    </>
  );

  return (
    <AuthForm
      title="Sign Up"
      description=""
      submitText="Sign Up"
      onSubmit={handleSubmit}
      footerContent={signUpFooter}
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
        type="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        minLength={8}
      />
    </AuthForm>
  );
}
