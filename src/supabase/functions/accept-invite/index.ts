import { createClient } from "@supabase/supabase-js";

// CORS headers — adjust origin for production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AcceptInviteBody {
  invite_token: string;
  mode: "guest" | "authenticated";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invite_token, mode }: AcceptInviteBody = await req.json();

    if (!invite_token || !mode) {
      return jsonResponse({ error: "invite_token and mode are required" }, 400);
    }

    if (!["guest", "authenticated"].includes(mode)) {
      return jsonResponse(
        { error: "mode must be 'guest' or 'authenticated'" },
        400,
      );
    }

    // Service role client — bypasses RLS. Never expose this key client-side.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Look up the pending invite by token
    const { data: member, error: fetchError } = await supabaseAdmin
      .from("group_members")
      .select("id, group_id, email, guest_name, status, expires_at")
      .eq("invite_token", invite_token)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return jsonResponse({ error: "Failed to look up invite" }, 500);
    }

    if (!member) {
      return jsonResponse({ error: "Invite not found or already used" }, 404);
    }

    // 2. Check expiry
    if (member.expires_at && new Date(member.expires_at) < new Date()) {
      return jsonResponse({ error: "This invite has expired" }, 410);
    }

    // 3. Branch on mode
    if (mode === "guest") {
      const { error: updateError } = await supabaseAdmin
        .from("group_members")
        .update({
          status: "active",
          invite_token: null,
        })
        .eq("id", member.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return jsonResponse({ error: "Failed to accept invite" }, 500);
      }

      return jsonResponse({
        success: true,
        group_id: member.group_id,
        mode: "guest",
      });
    }

    // mode === "authenticated" — requires a valid session token in the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(
        { error: "Authorization header required for authenticated mode" },
        401,
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !userData?.user) {
      return jsonResponse({ error: "Invalid or expired session" }, 401);
    }

    const authenticatedUser = userData.user;

    // Optional but recommended: confirm the email matches who was invited
    if (
      member.email &&
      authenticatedUser.email?.toLowerCase() !== member.email.toLowerCase()
    ) {
      return jsonResponse(
        { error: "This invite was sent to a different email address" },
        403,
      );
    }

    // Guard against the same user already being a member of this group
    const { data: existingMembership } = await supabaseAdmin
      .from("group_members")
      .select("id")
      .eq("group_id", member.group_id)
      .eq("user_id", authenticatedUser.id)
      .maybeSingle();

    if (existingMembership) {
      // Clean up the duplicate pending row and treat as success
      await supabaseAdmin.from("group_members").delete().eq("id", member.id);
      return jsonResponse({
        success: true,
        group_id: member.group_id,
        mode: "authenticated",
        note: "already_member",
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("group_members")
      .update({
        user_id: authenticatedUser.id,
        status: "active",
        invite_token: null,
      })
      .eq("id", member.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return jsonResponse({ error: "Failed to accept invite" }, 500);
    }

    return jsonResponse({
      success: true,
      group_id: member.group_id,
      mode: "authenticated",
    });
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
