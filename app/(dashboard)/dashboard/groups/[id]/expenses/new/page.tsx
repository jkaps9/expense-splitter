import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import ExpenseForm from "./ExpenseForm";

type MemberWithUser = {
  id: string;
  guest_name: string | null;
  user: { display_name: string } | null;
};

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: members, error } = await supabase
    .from("group_members")
    .select(
      `id,
    guest_name,
    user:users(display_name)
    `,
    )
    .eq("group_id", id)
    .overrideTypes<MemberWithUser[]>();

  if (error || !members) {
    if (!members) console.log("group not found");
    if (error) console.log("error", error);
    notFound();
  }

  const formattedMembers = members.map((member) => ({
    id: member.id,
    display_name: member.user?.display_name || member.guest_name || "Unknown",
  }));

  return (
    <>
      <section className="add-expense">
        <div className="container">
          <ExpenseForm
            groupId={id}
            groupMembers={formattedMembers}
          ></ExpenseForm>
        </div>
      </section>
    </>
  );
}
