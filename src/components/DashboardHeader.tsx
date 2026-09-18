import ReactLogo from "@assets/react.svg?react";
import styles from "@styles/Header.module.css";
import { supabase } from "@/lib/supabase";

export default function DashboardHeader() {
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  return (
    <header className={`${styles.header}`}>
      <div className={styles.logo}>
        <ReactLogo aria-hidden="true" />
        <span>Expense Splitter</span>
      </div>
      <div className="row">
        <button type="button" onClick={signOut} className="btn btn--secondary">
          Sign out
        </button>
      </div>
    </header>
  );
}
