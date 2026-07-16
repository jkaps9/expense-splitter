"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const default_currency =
    (formData.get("default_currency") as string) || "USD";

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name,
      description,
      default_currency,
    })
    .select()
    .single();

  if (groupError || !group) {
    return {
      error: groupError?.message || "Failed to create group",
    };
  }

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
  });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect(`/dashboard/groups/${group.id}`);
}
