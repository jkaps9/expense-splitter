import { SubmitButton } from "@/components/submit-button";
import { signIn } from "./actions";

export default function Login() {
  return (
    <>
      <section className="login" id="login">
        <form>
          <label htmlFor="display_name">Display Name (For Signup)</label>
          <input
            id="display_name"
            name="display_name"
            placeholder="John Doe"
            autoComplete="name"
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="password"
            placeholder="••••••••"
            required
          />
          <div>
            <SubmitButton formAction={signIn} pendingText="Signing In...">
              Sign In
            </SubmitButton>
          </div>
        </form>
      </section>
    </>
  );
}
