import ReactLogo from "@assets/react.svg?react";
import SupabaseLogo from "@assets/supabase.svg?react";
import styles from "@styles/Header.module.css";

export default function AuthHeader() {
  return (
    <header className={styles.header}>
      <h1>
        <span className="sr-only">React Supabase Starter</span>
        <ReactLogo aria-hidden="true" />
        <SupabaseLogo aria-hidden="true" />
      </h1>
    </header>
  );
}
