import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const signOut = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return claims ? (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      Hey, {claims.email}!
      <form action={signOut}>
        <button>Logout</button>
      </form>
    </div>
  ) : (
    <Link href="/login">Login</Link>
  );
}
