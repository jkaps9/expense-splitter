import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import DashboardHeader from "@components/DashboardHeader";
import styles from "@styles/DashboardBase.module.css";
import { ProfileData } from "@/types";
import { supabase } from "@/lib/supabase";

export default function DashboardBase() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: "",
    avatar_url: null,
    default_currency: "",
    notification_settings: { email_alerts: true },
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [profile] = await Promise.all([
          supabase.from("users").select("*").limit(1).single(),
        ]);

        if (profile.error) {
          console.error("Error fetching user data", profile.error.message);
        } else {
          setProfileData(profile.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();

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
  };

  return (
    <div className={styles.dashboard}>
      <DashboardHeader display_name={profileData.display_name} />
      <main>
        <h1>Dashboard</h1>
        <Outlet context={outletProps} />
      </main>
    </div>
  );
}
