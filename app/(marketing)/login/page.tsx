import { SubmitButton } from "@/components/SubmitButton";
import { signIn } from "./actions";

export default function Login() {
  return (
    <>
      <section className="login" id="login">
        <div className="container">
          <form>
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
        </div>
      </section>
    </>
  );
}
