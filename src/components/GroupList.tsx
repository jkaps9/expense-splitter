import { Group } from "@/types";

interface GroupsProps {
  groups: Group[];
  handleClick: (id: string) => void;
}

export default function GroupList({ groups, handleClick }: GroupsProps) {
  return (
    <>
      <div>
        <h2>Groups</h2>
      </div>
      <ul>
        {groups &&
          groups.map((group) => (
            <li key={group.id}>
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
