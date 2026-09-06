import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInviteBody {
  group_member_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { group_member_id }: SendInviteBody = await req.json();

    if (!group_member_id) {
      return jsonResponse({ error: "group_member_id is required" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pull the member row plus the group name for the email copy.
    const { data: member, error: fetchError } = await supabaseAdmin
      .from("group_members")
      .select("id, email, guest_name, invite_token, status, groups(name)")
      .eq("id", group_member_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return jsonResponse({ error: "Failed to look up group member" }, 500);
    }

    if (!member) {
      return jsonResponse({ error: "Group member not found" }, 404);
    }

    if (!member.email || member.status !== "pending" || !member.invite_token) {
      return jsonResponse(
        { error: "This member is not in a valid pending-invite state" },
        400,
      );
    }

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";
    const inviteLink = `${appUrl}/invite/${member.invite_token}`;
    const groupName =
      (member.groups as { name?: string } | null)?.name ?? "a group";

    // Uses Resend here — swap for your email provider of choice.
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("INVITE_FROM_EMAIL") ?? "invites@yourapp.com",
        to: member.email,
        subject: `You've been invited to join ${groupName}`,
        html: `
          <p>Hi ${member.guest_name ?? "there"},</p>
          <p>You've been invited to join <strong>${groupName}</strong>.</p>
          <p><a href="${inviteLink}">Click here to accept the invite</a></p>
          <p>This link expires in 7 days.</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend error:", errText);
      return jsonResponse({ error: "Failed to send invite email" }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
