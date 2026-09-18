import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { QueryData } from "@supabase/supabase-js";
import { Group, Expense } from "@/types";
import { useState, useEffect } from "react";
import { CURRENCIES } from "@/constants";
import ExpenseListStyles from "@styles/ExpenseList.module.css";
import GroupDetailStyles from "@styles/GroupDetails.module.css";
import EditIcon from "@assets/edit.svg?react";
import DeleteIcon from "@assets/trash.svg?react";
import SettingsIcon from "@assets/settings.svg?react";

export default function GroupDetails({ id }: { id: string }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [groupDetails, setGroupDetails] = useState<Group>({
    id: "",
    name: "",
    description: "",
    default_currency: "",
    created_at: "",
  });

  const membersBaseQuery = supabase
    .from("group_members")
    .select("*, users(display_name)");

  type GroupMembersWithDisplayName = QueryData<typeof membersBaseQuery>;

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
            supabase
              .from("group_members")
              .select("*, users(display_name)")
              .eq("group_id", id),
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
  }, [id]);

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
      <div className={GroupDetailStyles.header}>
        <div className={GroupDetailStyles.headerNameAndDescription}>
          <h1>{groupDetails.name}</h1>
          <p>{groupDetails.description}</p>
        </div>
        <div className={GroupDetailStyles.headerButtons}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={newExpense}
          >
            + Add expense
          </button>
          <button type="button" className="btn btn--secondary">
            <span className="sr-only">open settings dropdown</span>
            <SettingsIcon></SettingsIcon>
          </button>
          <button type="button" className="btn btn--naked" onClick={editGroup}>
            <EditIcon></EditIcon>
            <span className="sr-only">Edit Group</span>
          </button>
          <button
            type="button"
            className="btn btn--destructive btn--naked"
            onClick={deleteGroup}
          >
            <DeleteIcon></DeleteIcon>
            <span className="sr-only">Delete Group</span>
          </button>
        </div>
      </div>
      <div>
        <div className="row">
          <h2>Group Members</h2>
          <div>
            <button
              type="button"
              className="btn btn--naked"
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
      {groupExpenses && groupExpenses.length > 0 ? (
        <ul className={ExpenseListStyles.expenseList}>
          {groupExpenses.map((expense) => (
            <li key={expense.id} className={ExpenseListStyles.expenseItem}>
              <div className={ExpenseListStyles.itemDetails}>
                <span className={ExpenseListStyles.itemDescription}>
                  {expense.description}
                </span>
                <strong>
                  {
                    CURRENCIES.find((c) => c.iso_code === expense.currency)
                      ?.symbol
                  }
                  {expense.amount.toFixed(2)}
                </strong>
                <span>{/* TODO: add payer */}payer</span>
                <span>{new Date(expense.created_at).toLocaleDateString()}</span>
              </div>
              <div className={ExpenseListStyles.itemButtons}>
                <button
                  type="button"
                  className="btn btn--naked"
                  onClick={() => editExpense(expense)}
                >
                  <EditIcon></EditIcon>
                  <span className="sr-only">Edit</span>
                </button>
                <button
                  type="button"
                  className="btn btn--destructive btn--naked"
                  onClick={() => deleteExpense(expense.id)}
                >
                  <DeleteIcon></DeleteIcon>
                  <span className="sr-only">Delete</span>
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
