import ReactLogo from "@assets/react.svg?react";
import styles from "@styles/Header.module.css";
import { supabase } from "@/lib/supabase";

interface DashboardHeaderProps {
  display_name: string;
}

export default function DashboardHeader({
  display_name,
}: DashboardHeaderProps) {
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
      <div className="row">
        <p>Hey, {display_name}</p>
        <button type="button" onClick={signOut} className="btn btn--secondary">
          Sign out
        </button>
      </div>
    </header>
  );
}
