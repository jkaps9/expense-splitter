import Link from "next/link";
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
      {/* <Link href="/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link> */}

      <form className={styles.form}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          name="email"
          placeholder="you@example.com"
          required
          className={styles.input}
        />
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          className={styles.input}
        />
        <div className={styles.buttonGroup}></div>
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
        {searchParams?.message && <p>{searchParams.message}</p>}
      </form>
    </div>
  );
}
