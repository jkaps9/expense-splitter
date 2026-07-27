// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  if (groupsError) notFound();

  return (
    <section className="groups">
      <div className="container">
        <div className="groups__header">
          <h1>Your Groups</h1>
          <Link href="/dashboard/groups/new">+ New Group</Link>
        </div>
        {!groups || groups.length === 0 ? (
          <div>
            <p>You do not have any groups yet.</p>
            <p>
              Create one to start tracking expenses for an apartment, a project,
              or a family trip.
            </p>
          </div>
        ) : (
          <ul className="groups__list">
            {groups.map((group) => (
              <li key={group.id}>
                <Link href={`/dashboard/groups/${group.id}`}>
                  <h2>{group.name}</h2>
                  {group.description && <p>{group.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
