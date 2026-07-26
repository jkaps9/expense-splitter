import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";

import siteConfig from "@/data/site-config.json";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  if (authError) {
    redirect("/login");
  }
  return (
    <section className="hero">
      <div className="container">
        <Link href="/login">Log In / Sign Up</Link>
        <h1>{siteConfig.siteName}</h1>
        <p>{siteConfig.siteDescription}</p>
      </div>
    </section>
  );
}
