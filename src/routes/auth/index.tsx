import { Outlet } from "react-router";
import AuthHeader from "@/components/AuthHeader";
import styles from "@styles/AuthBase.module.css";

export default function AuthBase() {
  return (
    <div className={styles.auth}>
      <AuthHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
