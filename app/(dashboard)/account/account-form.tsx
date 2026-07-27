"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Claims = { sub: string; email?: string; [key: string]: unknown };

export default function AccountForm({ claims }: { claims: Claims | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [display_name, setDisplayName] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      if (!claims?.sub) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error, status } = await supabase
        .from("users")
        .select(`display_name, avatar_url`)
        .eq("id", claims.sub)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setDisplayName(data.display_name);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [claims, supabase]);

  useEffect(() => {
    getProfile();
  }, [claims, getProfile]);

  async function updateProfile({
    display_name,
    avatar_url,
  }: {
    display_name: string | null;
    avatar_url: string | null;
  }) {
    try {
      if (!claims?.sub) {
        alert("You must be logged in to update your profile");
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("users").upsert({
        id: claims.sub,
        display_name,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="form-widget">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="text" value={claims?.email ?? ""} disabled />
        </div>
        <div>
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={display_name || ""}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div>
          <button
            className="btn"
            onClick={() => updateProfile({ display_name, avatar_url })}
            disabled={loading || !claims?.sub}
          >
            {loading ? "Loading ..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
