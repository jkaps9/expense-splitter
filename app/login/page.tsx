import { SubmitButton } from "./submit-button";
import { signIn, signUp } from "./actions";
import styles from "./login.module.css";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className={styles.container}>
      <form className={styles.form}>
        <label htmlFor="display_name" className={styles.label}>
          Display Name (For Signup)
        </label>
        <input
          id="display_name"
          name="display_name"
          placeholder="John Doe"
          autoComplete="name"
          className={styles.input}
        />

        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={styles.input}
        />

        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="password"
          placeholder="••••••••"
          required
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <SubmitButton
            formAction={signIn}
            pendingText="Signing In..."
            className={styles.loginButton}
          >
            Sign In
          </SubmitButton>
          <SubmitButton
            formAction={signUp}
            pendingText="Signing Up..."
            className={styles.signupButton}
          >
            Sign Up
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
