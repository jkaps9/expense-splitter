import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import DashboardHeader from "@components/DashboardHeader";
import styles from "@styles/DashboardBase.module.css";
import { ProfileData, Group } from "@/types";
import { supabase } from "@/lib/supabase";

import Groups from "@/components/Groups";

export default function DashboardBase() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: "",
    avatar_url: null,
    default_currency: "",
    notification_settings: { email_alerts: true },
  });

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, groupsRes] = await Promise.all([
          supabase.from("users").select("*").limit(1).single(),
          supabase
            .from("groups")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (profileRes.error) {
          console.error("Error fetching user data", profileRes.error.message);
        } else {
          setProfileData(profileRes.data);
        }

        if (groupsRes.error) {
          console.error("Error fetching groups", groupsRes.error.message);
        } else {
          setGroups(groupsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setProfileData({
            display_name: "",
            avatar_url: null,
            default_currency: "",
            notification_settings: { email_alerts: true },
          });
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const outletProps = {
    profileData,
    groups,
  };

  return (
    <div className={styles.dashboard}>
      <DashboardHeader display_name={profileData.display_name} />
      <main>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <Groups groups={groups}></Groups>
            <Outlet context={outletProps} />
          </>
        )}
      </main>
    </div>
  );
}
