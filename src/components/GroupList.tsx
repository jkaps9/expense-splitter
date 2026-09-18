import { Group } from "@/types";

interface GroupsProps {
  groups: Group[];
  handleClick: (id: string) => void;
}

export default function GroupList({ groups, handleClick }: GroupsProps) {
  return (
    <>
      <div>
        <h1>Groups</h1>
      </div>
      <ul>
        {groups &&
          groups.map((group) => (
            <li key={group.id}>
              <button
                className="btn btn--naked"
                onClick={() => handleClick(group.id)}
              >
                <h2>{group.name}</h2>
              </button>
            </li>
          ))}
      </ul>
    </>
  );
}
