import { useNavigate, Outlet } from "react-router";
import styles from "@styles/GroupsBase.module.css";

export default function GroupsBase() {
  const navigate = useNavigate();

  return (
    <div className={styles.groups}>
      <header>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </header>
      <main>
        <Outlet></Outlet>
      </main>
    </div>
  );
}
