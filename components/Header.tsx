import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";

export default function Header() {
  return (
    <div>
      <div>
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          <SupabaseLogo />
        </a>
        <span />
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div>
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p>
        The fastest way to build apps with{" "}
        <a
          href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
          target="_blank"
          rel="noreferrer"
        >
          Supabase
        </a>{" "}
        and{" "}
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          Next.js
        </a>
      </p>
      <div />
    </div>
  );
}
