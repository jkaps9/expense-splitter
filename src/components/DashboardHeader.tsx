import ReactLogo from "@assets/react.svg?react";
import styles from "@styles/Header.module.css";
import { supabase } from "@/lib/supabase";

export default function DashboardHeader() {
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  return (
    <header className={`row ${styles.header}`}>
      <div className={styles.logo}>
        <ReactLogo aria-hidden="true" />
        <span>React Supabase Starter</span>
      </div>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </header>
  );
}
