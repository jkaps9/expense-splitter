import DeployButton from "@/components/DeployButton";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return redirect("/login");
  }

  return (
    <div>
      <div>
        <div>
          This is a protected page that you can only see as an authenticated
          user
        </div>
        <nav>
          <div>
            <DeployButton />
            <AuthButton />
          </div>
        </nav>
      </div>

      <div>
        <Header />
        <main>
          <h2>Next steps</h2>
        </main>
      </div>

      <footer>
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
