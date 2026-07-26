// app/dashboard/groups/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./group.module.css";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next.js 15+, dynamic params are a Promise
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch the specific group. RLS ensures they can only read it if they are a member.
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  // If the group doesn't exist or RLS blocks them, show a 404
  if (groupError || !group) {
    notFound();
  }

  // 2. Fetch the members of this group (joining with the public.users table for registered users)
  const { data: members } = await supabase
    .from("group_members")
    .select(
      `
      id,
      guest_name,
      users ( full_name )
    `,
    )
    .eq("group_id", id);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Back to Dashboard
          </Link>
          <h1 className={styles.title}>{group.name}</h1>
          {group.description && (
            <p className={styles.description}>{group.description}</p>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryButton}>Add Member</button>
          <button className={styles.primaryButton}>Add Expense</button>
        </div>
      </header>

      <main className={styles.layoutGrid}>
        {/* Left Column: Expenses Feed */}
        <section className={styles.mainFeed}>
          <h2 className={styles.sectionTitle}>Expenses</h2>
          <div className={styles.emptyState}>
            No expenses yet. Add one to get started!
          </div>
        </section>

        {/* Right Column: Balances & Members */}
        <aside className={styles.sidebar}>
          <section className={styles.memberSection}>
            <h2 className={styles.sectionTitle}>
              Members ({members?.length || 0})
            </h2>
            <ul className={styles.memberList}>
              {members?.map((member) => {
                // Handle the display logic for registered users vs. guests
                const displayName = member.guest_name || "Unknown";
                return (
                  <li key={member.id} className={styles.memberItem}>
                    <div className={styles.avatar}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.memberName}>{displayName}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
}
