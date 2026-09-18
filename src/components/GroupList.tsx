import { Group } from "@/types";
import { Link } from "react-router";

interface GroupsProps {
  groups: Group[];
}

export default function GroupList({ groups }: GroupsProps) {
  return (
    <>
      <div>
        <h1>Groups</h1>
      </div>
      <ul>
        {groups &&
          groups.map((group) => (
            <li key={group.id}>
              <Link to={`/groups/${group.id}`}>
                <h2>{group.name}</h2>
                <p>{group.description}</p>
              </Link>
            </li>
          ))}
      </ul>
    </>
  );
}
