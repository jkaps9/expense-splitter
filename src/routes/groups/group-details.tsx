import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Group, Expense } from "@/types";
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

  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [groupDetailRes, expensesRes] = await Promise.all([
          supabase.from("groups").select("*").eq("id", id),
          supabase.from("expenses").select("*").eq("group_id", id),
        ]);

        if (groupDetailRes.error) {
          console.error("Error fetching groups", groupDetailRes.error.message);
        } else {
          setGroupDetails(groupDetailRes.data[0]);
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
        groupDetails: groupDetails,
      },
    });
  };

  const deleteExpense = async (expenseId) => {
    const response = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId);

    if (response.success) {
      alert("expense deleted");
    } else {
      alert(`something went wrong\n${response.status}: ${response.statusText}`);
    }
  };

  const editExpense = (expense) => {
    navigate(`${import.meta.env.BASE_URL}/expenses/edit/${expense.id}`, {
      state: { expense: expense },
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
      {groupExpenses && groupExpenses.length > 0 ? (
        <ul>
          {groupExpenses.map((expense) => (
            <li key={expense.id} className="row">
              <div className="row" style={{ gap: "0.5rem" }}>
                <p>{expense.description}</p>
                <p>{expense.amount}</p>
                <p>{new Date(expense.created_at).toLocaleDateString()}</p>
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
