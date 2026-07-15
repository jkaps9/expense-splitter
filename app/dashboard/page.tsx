// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import AuthButton from "@/components/AuthButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Fetch groups. RLS ensures they only see their own groups.
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container">
      <header>
        <div className="container" style={{ marginBlock: "2rem" }}>
          <AuthButton></AuthButton>
        </div>
      </header>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Groups</h1>
        <button className={styles.newGroupButton}>+ New Group</button>
      </header>

      <main className={styles.main}>
        {!groups || groups.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>You do not have any groups yet.</p>
            <p className={styles.emptySubtext}>
              Create one to start tracking expenses for an apartment, a project,
              or a family trip.
            </p>
          </div>
        ) : (
          <ul className={styles.groupList}>
            {groups.map((group) => (
              <li key={group.id} className={styles.groupCard}>
                <Link
                  href={`/dashboard/groups/${group.id}`}
                  className={styles.groupLink}
                >
                  <h2 className={styles.groupName}>{group.name}</h2>
                  {group.description && (
                    <p className={styles.groupDescription}>
                      {group.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
