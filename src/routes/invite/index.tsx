import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";

const SUPABASE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

type AcceptMode = "guest" | "authenticated";

type PageStatus =
  | "checking_session" // initial mount, waiting to see if a session already exists
  | "choosing" // no session yet, show guest / sign-in / sign-up options
  | "authenticating" // password sign-in/up submitted, waiting on Supabase
  | "submitting" // calling the accept-invite edge function
  | "success"
  | "error";

interface AcceptInviteResult {
  success?: boolean;
  group_id?: string;
  mode?: AcceptMode;
  note?: string;
  error?: string;
}

async function callAcceptInvite(
  inviteToken: string,
  mode: AcceptMode,
  accessToken?: string,
): Promise<AcceptInviteResult> {
  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/accept-invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ invite_token: inviteToken, mode }),
  });

  const result: AcceptInviteResult = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error ?? "Something went wrong accepting the invite.",
    );
  }

  return result;
}

export default function AcceptInvite() {
  const { token: inviteToken } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PageStatus>(() =>
    inviteToken ? "checking_session" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    inviteToken ? null : "This invite link is missing a token.",
  );
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Guards against double-submitting the accept-invite call
  // (e.g. onAuthStateChange firing after we've already handled a session).
  const hasAcceptedRef = useRef(false);

  useEffect(() => {
    if (!inviteToken) return;

    const acceptAsAuthenticated = async (accessToken: string) => {
      if (hasAcceptedRef.current) return;
      hasAcceptedRef.current = true;

      setStatus("submitting");
      try {
        const result = await callAcceptInvite(
          inviteToken,
          "authenticated",
          accessToken,
        );
        setStatus("success");
        setTimeout(() => navigate(`/groups/${result.group_id}`), 1500);
      } catch (err) {
        hasAcceptedRef.current = false;
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to accept invite.",
        );
      }
    };

    // Case 1: a session already exists when this page loads
    // (e.g. user was already logged in).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        acceptAsAuthenticated(session.access_token);
      } else {
        setStatus((current) =>
          current === "checking_session" ? "choosing" : current,
        );
      }
    });

    // Case 2: a session materializes after this page loads
    // (e.g. magic link / OAuth redirect completes, or password sign-in below succeeds).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        acceptAsAuthenticated(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [inviteToken, navigate]);

  const handleContinueAsGuest = async () => {
    if (!inviteToken || hasAcceptedRef.current) return;
    hasAcceptedRef.current = true;

    setStatus("submitting");
    try {
      const result = await callAcceptInvite(inviteToken, "guest");
      setStatus("success");
      setTimeout(() => navigate(`/groups/${result.group_id}`), 1500);
    } catch (err) {
      hasAcceptedRef.current = false;
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to accept invite.",
      );
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("authenticating");
    setErrorMessage(null);

    const { error } =
      authView === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/invite/${inviteToken}`,
            },
          });

    if (error) {
      setStatus("choosing");
      setErrorMessage(error.message);
      return;
    }

    // On sign-in, onAuthStateChange fires SIGNED_IN immediately and the
    // useEffect above takes it from here.
    // On sign-up, if email confirmation is required, no session exists yet —
    // let the user know to check their inbox.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session && authView === "signup") {
      setStatus("choosing");
      setErrorMessage(
        "Check your email to confirm your account, then return to this link.",
      );
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMessage("Enter your email first.");
      return;
    }
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/invite/${inviteToken}`,
      },
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("Check your email for a sign-in link.");
    }
  };

  if (status === "checking_session") {
    return (
      <InviteCard>
        <p>Checking your invite…</p>
      </InviteCard>
    );
  }

  if (status === "submitting" || status === "authenticating") {
    return (
      <InviteCard>
        <p>{status === "submitting" ? "Joining group…" : "Signing you in…"}</p>
      </InviteCard>
    );
  }

  if (status === "success") {
    return (
      <InviteCard>
        <p>You're in! Redirecting to the group…</p>
      </InviteCard>
    );
  }

  if (status === "error") {
    return (
      <InviteCard>
        <p className="error">
          {errorMessage ?? "This invite could not be accepted."}
        </p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </InviteCard>
    );
  }

  // status === "choosing"
  return (
    <InviteCard>
      <h2>You've been invited to join a group</h2>

      <button className="primary" onClick={handleContinueAsGuest}>
        Continue as guest
      </button>

      <div className="divider">or sign in / create an account</div>

      {errorMessage && <p className="notice">{errorMessage}</p>}

      <div className="tabs">
        <button
          className={authView === "signin" ? "active" : ""}
          onClick={() => setAuthView("signin")}
        >
          Sign in
        </button>
        <button
          className={authView === "signup" ? "active" : ""}
          onClick={() => setAuthView("signup")}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handlePasswordAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit">
          {authView === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button className="link" onClick={handleMagicLink}>
        Or email me a sign-in link instead
      </button>
    </InviteCard>
  );
}

function InviteCard({ children }: { children: React.ReactNode }) {
  return <div className="invite-card">{children}</div>;
}
