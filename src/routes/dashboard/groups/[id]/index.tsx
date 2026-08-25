import { useParams } from "react-router";

export default function GroupDetails() {
  const { id } = useParams();

  return (
    <>
      <h1>{id}</h1>
      <p>Dynamic route! Yeehaw!</p>
    </>
  );
}
