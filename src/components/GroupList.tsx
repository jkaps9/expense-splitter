import { Group } from "@/types";
import styles from "@styles/GroupList.module.css";

interface GroupsProps {
  groups: Group[];
  handleClick: (id: string) => void;
}

export default function GroupList({ groups, handleClick }: GroupsProps) {
  return (
    <>
      <span className={`${styles.title} muted-text`}>Groups</span>
      <ul className={styles.list}>
        {groups &&
          groups.map((group) => (
            <li key={group.id} className={`${styles.listItem} muted-text`}>
              <button
                className="btn btn--naked"
                onClick={() => handleClick(group.id)}
              >
                <span>{group.name}</span>
              </button>
            </li>
          ))}
      </ul>
    </>
  );
}
