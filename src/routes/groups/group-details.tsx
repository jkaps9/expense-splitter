import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Group } from "@/types";
import { useState, useEffect } from "react";

export default function GroupDetails() {
  const [loading, setLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState<Group>({
    id: "",
    name: "",
    description: "",
    default_currency: "",
    created_at: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupDetailRes] = await Promise.all([
          supabase.from("groups").select("*").eq("id", id),
        ]);

        if (groupDetailRes.error) {
          console.error("Error fetching groups", groupDetailRes.error.message);
        } else {
          setGroupDetails(groupDetailRes.data[0]);
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
          setGroupDetails({
            id: "",
            name: "",
            description: "",
            default_currency: "",
            created_at: "",
          });
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const deleteGroup = async () => {
    const response = await supabase.from("groups").delete().eq("id", id);

    if (response.success) {
      alert("group deleted");
      navigate(-1);
    } else {
      alert(`something went wrong\n${response.status}: ${response.statusText}`);
    }
  };

  const editGroup = () => {
    navigate(`${import.meta.env.BASE_URL}/groups/edit/${id}`, {
      state: { groupDetails: groupDetails },
    });
  };

  const newExpense = () => {
    navigate(`${import.meta.env.BASE_URL}/expenses/new/`, {
      state: {
        default_currency: groupDetails.default_currency,
      },
    });
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      <div className="row">
        <div>
          <h1>{groupDetails.name}</h1>
          <p>{groupDetails.description}</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={editGroup}
          >
            Edit Group
          </button>
          <button
            type="button"
            className="btn btn--destructive"
            onClick={deleteGroup}
          >
            Delete Group
          </button>
        </div>
      </div>
      <div>
        <button type="button" className="btn btn--primary" onClick={newExpense}>
          + Add Expense
        </button>
      </div>
    </>
  );
}
