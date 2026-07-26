// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
      <header>
        <h1>Your Groups</h1>
        <Link href="/dashboard/groups/new">+ New Group</Link>
      </header>

      <main>
        {!groups || groups.length === 0 ? (
          <div>
            <p>You do not have any groups yet.</p>
            <p>
              Create one to start tracking expenses for an apartment, a project,
              or a family trip.
            </p>
          </div>
        ) : (
          <ul>
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
      </main>
    </div>
  );
}
