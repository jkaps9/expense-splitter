import { useState, useEffect } from "react";
import { Link } from "react-router";
import DashboardHeader from "@components/DashboardHeader";
import styles from "@styles/DashboardBase.module.css";
import { ProfileData, Group } from "@/types";
import { supabase } from "@/lib/supabase";
import AddIcon from "@assets/add.svg?react";

import GroupList from "@/components/GroupList";
import GroupDetails from "../groups/group-details";

export default function DashboardBase() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: "",
    avatar_url: null,
    default_currency: "",
    notification_settings: { email_alerts: true },
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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

  const setGroupId = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DashboardHeader />
              <GroupList groups={groups} handleClick={setGroupId}></GroupList>
            </>
          )}
        </div>
        <div className={styles.sidebarBottom}>
          <Link to="/groups/new" className="btn btn--naked">
            <AddIcon aria-hidden="true"></AddIcon>
            <span>New Group</span>
          </Link>
        </div>
      </aside>
      <main className={styles.main}>
        <section>
          {selectedGroupId ? (
            <GroupDetails id={selectedGroupId}></GroupDetails>
          ) : (
            <p>no group selected</p>
          )}
        </section>
      </main>
    </div>
  );
}
