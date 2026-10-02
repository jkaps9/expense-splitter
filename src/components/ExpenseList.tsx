import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Expense } from "@/types";
import { CURRENCIES } from "@/constants";
import { useRef } from "react";

import styles from "@styles/ExpenseList.module.css";
import ActionMenu from "@/components/ActionMenu";
import EditIcon from "@assets/edit.svg?react";
import DeleteIcon from "@assets/trash.svg?react";
import VerticalMenuIcon from "@assets/vertical-menu.svg?react";

export default function ExpenseList({
  expenseList,
}: {
  expenseList: Expense[];
}) {
  const navigate = useNavigate();
  const actionTriggerRef = useRef(null);

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
        setGroupExpenses((prev) =>
          prev.filter((expense) => expense.id !== expenseId),
        );
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

  const getExpenseActions = (expense: Expense) => [
    {
      label: "Edit expense",
      onClick: () => editExpense(expense),
      icon: EditIcon,
    },
    {
      label: "Delete expense",
      onClick: () => deleteExpense(expense.id),
      isDestructive: true,
      icon: DeleteIcon,
    },
  ];

  return (
    <>
      {expenseList && expenseList.length > 0 ? (
        <ul className={styles.expenseList}>
          {expenseList.map((expense) => (
            <li key={expense.id} className={styles.expenseItem}>
              <div className={styles.itemDetails}>
                <span className={styles.itemDescription}>
                  {expense.description}
                </span>
                <div className={styles.dateAndPayer}>
                  <span className="muted-text">
                    {expense.payer?.users?.display_name ||
                      expense.payer?.guest_name ||
                      "Unknown"}
                  </span>
                  <span className="muted-text">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.amountAndButtons}>
                <span className={`amount-text ${styles.itemAmount}`}>
                  {
                    CURRENCIES.find((c) => c.iso_code === expense.currency)
                      ?.symbol
                  }
                  {expense.amount.toFixed(2)}
                </span>
                <div className={styles.itemButtons}>
                  <ActionMenu
                    MenuIcon={VerticalMenuIcon}
                    triggerRef={actionTriggerRef}
                    actions={getExpenseActions(expense)}
                    ariaLabel={"Open expense settings menu"}
                  ></ActionMenu>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>
            You have not added any expenses yet
          </p>
          <p className="muted-text">
            To add a new expense, click the "Add expense" button.
          </p>
        </div>
      )}
    </>
  );
}
