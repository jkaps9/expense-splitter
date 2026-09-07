import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { QueryData } from "@supabase/supabase-js";
import { Group, Expense } from "@/types";
import { useState, useEffect } from "react";
import { CURRENCIES } from "@/constants";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState<Group>({
    id: "",
    name: "",
    description: "",
    default_currency: "",
    created_at: "",
  });

  const groupMemberQuery = supabase
    .from("group_members")
    .select("*, users(display_name)")
    .eq("group_id", id);
  type GroupMembersWithDisplayName = QueryData<typeof groupMemberQuery>;

  const [groupMembers, setGroupMembers] = useState<
    GroupMembersWithDisplayName[]
  >([]);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupDetailRes, groupMembersRes, expensesRes] =
          await Promise.all([
            supabase.from("groups").select("*").eq("id", id),
            groupMemberQuery,
            supabase
              .from("expenses")
              .select("*, splits(*)")
              .eq("group_id", id)
              .order("created_at", { ascending: false }),
          ]);

        if (groupDetailRes.error) {
          console.error("Error fetching groups", groupDetailRes.error.message);
        } else {
          setGroupDetails(groupDetailRes.data[0]);
        }

        if (groupMembersRes.error) {
          console.error(
            "Error fetching group members",
            groupMembersRes.error.message,
          );
        } else {
          setGroupMembers(groupMembersRes.data);
        }

        if (expensesRes.error) {
          console.error("Error fetching group expenses");
        } else {
          setGroupExpenses(expensesRes.data);
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
    if (
      window.confirm(
        `Are you sure you want to delete ${groupDetails.name}?  This action is irreversible.`,
      )
    ) {
      const response = await supabase.from("groups").delete().eq("id", id);

      if (response.success) {
        alert("group deleted");
        navigate(`${import.meta.env.BASE_URL}/dashboard`);
      } else {
        alert(
          `something went wrong\n${response.status}: ${response.statusText}`,
        );
      }
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
        groupDetails: groupDetails,
        groupMembers: groupMembers,
      },
    });
  };

  const deleteExpense = async (expenseId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this expense? This action is irreversible.",
      )
    ) {
      const response = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (response.success) {
        alert("expense deleted");
      } else {
        alert(
          `something went wrong\n${response.status}: ${response.statusText}`,
        );
      }
    }
  };

  const editExpense = (expense: Expense) => {
    navigate(`${import.meta.env.BASE_URL}/expenses/edit/${expense.id}`, {
      state: {
        groupDetails: groupDetails,
        groupMembers: groupMembers,
        expense: expense,
        splits: expense.splits || [],
      },
    });
  };

  const newMember = () => {
    navigate(`${import.meta.env.BASE_URL}/groups/new-member/`, {
      state: {
        groupDetails: groupDetails,
        groupMembers: groupMembers,
      },
    });
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      <div className="row">
        <div style={{ display: "flex", flexDirection: "column" }}>
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
        <div className="row">
          <h2>Group Members</h2>
          <div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={newMember}
            >
              + Add Member
            </button>
          </div>
        </div>
        <ul>
          {groupMembers.map((member) => (
            <li key={member.id}>
              {member.users?.display_name ?? member.guest_name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button type="button" className="btn btn--primary" onClick={newExpense}>
          + Add Expense
        </button>
      </div>
      {groupExpenses && groupExpenses.length > 0 ? (
        <ul>
          {groupExpenses.map((expense) => (
            <li key={expense.id} className="row">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr repeat(3, 1fr)",
                  gap: "0.5rem",
                  flex: "1",
                }}
              >
                <span>{expense.description}</span>
                <strong>
                  {
                    CURRENCIES.find((c) => c.iso_code === expense.currency)
                      ?.symbol
                  }
                  {expense.amount.toFixed(2)}
                </strong>
                <span>{/* TODO: add payer */}</span>
                <span>{new Date(expense.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => editExpense(expense)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn--destructive"
                  onClick={() => deleteExpense(expense.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Add an expense</p>
      )}
    </>
  );
}
