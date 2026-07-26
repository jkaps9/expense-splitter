import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

type MemberWithUser = {
  id: string;
  guest_name: string | null;
  user: { display_name: string } | null;
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  if (groupError || !group) notFound();

  const { data: members } = await supabase
    .from("group_members")
    .select(
      `
      id,
      guest_name,
      user:users ( display_name )
    `,
    )
    .eq("group_id", id)
    .overrideTypes<MemberWithUser[]>();

  return (
    <>
      <section className="group-details">
        <div className="container">
          <div className="group-details">
            <h1>{group.name}</h1>
            <p>{group.description}</p>
          </div>
          <h2>Members</h2>
          <ul className="member-list">
            {members?.map((member) => {
              const displayName = member.guest_name || "Unknown";
              return (
                <li key={member.id} className="member-list__item">
                  {member.user?.display_name || displayName}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
