import { Outlet } from "react-router";
import DashboardHeader from "@components/DashboardHeader";
import styles from "@styles/DashboardBase.module.css";

export default function DashboardBase() {
  return (
    <div className={styles.dashboard}>
      <DashboardHeader />
      <main>
        <h1>Dashboard</h1>
        <Outlet />
      </main>
    </div>
  );
}
