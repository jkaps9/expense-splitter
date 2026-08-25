import { useParams, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";

export default function GroupDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const deleteGroup = async () => {
    const response = await supabase.from("groups").delete().eq("id", id);

    if (response.success) {
      alert("group deleted");
      navigate(-1);
    } else {
      alert(`something went wrong\n${response.status}: ${response.statusText}`);
    }
  };

  return (
    <>
      <h1>{id}</h1>
      <p>Dynamic route! Yeehaw!</p>
      <button
        type="button"
        className="btn btn--destructive"
        onClick={deleteGroup}
      >
        Delete Group
      </button>
    </>
  );
}
