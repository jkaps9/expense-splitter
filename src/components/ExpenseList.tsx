import { Expense } from "@/types";
import { CURRENCIES } from "@/constants";
import { useRef } from "react";

import styles from "@styles/ExpenseList.module.css";
import ActionMenu from "@/components/ActionMenu";
import MemberBubble from "@components/MemberBubble";
import VerticalMenuIcon from "@assets/vertical-menu.svg?react";

interface ExpenseListProps {
  expenseList: Expense[];
  getExpenseActions: (expense: Expense) => {
    label: string;
    onClick: () => void;
    isDestructive?: boolean;
    icon: React.ComponentType<React.ComponentProps<"svg">>;
  }[];
}

export default function ExpenseList({
  expenseList,
  getExpenseActions,
}: ExpenseListProps) {
  const actionTriggerRef = useRef(null);

  const currencyFormatter = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    return formatter.format(amount);
  };

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
                  <div className={styles.payer}>
                    <MemberBubble
                      name={
                        expense.payer?.users?.display_name ||
                        expense.payer?.guest_name ||
                        "Unknown"
                      }
                    ></MemberBubble>
                    <span className="muted-text">
                      {expense.payer?.users?.display_name ||
                        expense.payer?.guest_name ||
                        "Unknown"}
                    </span>
                  </div>
                  <span>&middot;</span>
                  <span className="muted-text">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.amountAndButtons}>
                <span className={`amount-text ${styles.itemAmount}`}>
                  {currencyFormatter(expense.amount, expense.currency)}
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
