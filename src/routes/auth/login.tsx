import { Link, useNavigate } from "react-router";
import FormInput from "@/components/FormInput";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/hooks/useFormValidation";

export default function Login() {
  const navigate = useNavigate();

  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: "", password: "" },
    validate: (values) => {
      const newErrors: Partial<Record<keyof typeof values, string>> = {};
      if (!values.email) newErrors.email = "Can't be empty";
      if (!values.password) newErrors.password = "Can't be blank";
      return newErrors;
    },
    onSubmit: async (values) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        alert(error.message);
      } else {
        navigate(`${import.meta.env.BASE_URL}/dashboard`);
      }
    },
  });

  const loginFooter = (
    <>
      <Link to="../reset-password" className="accent-text">
        Forgot password?
      </Link>
      <p>
        Don't have an account?{" "}
        <Link to="../signup" className="accent-text">
          Sign up
        </Link>
      </p>
    </>
  );

  return (
    <AuthForm
      title="Login"
      description=""
      submitText="Login"
      onSubmit={handleSubmit}
      footerContent={loginFooter}
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
    </AuthForm>
  );
}
