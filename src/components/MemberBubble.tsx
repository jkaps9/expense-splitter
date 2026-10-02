import styles from "@styles/MemberBubble.module.css";

export default function MemberBubble({ name }: { name: string }) {
  return (
    <div className={styles.memberBubble}>
      {name
        .split(" ")
        .map((word: string) => word[0])
        .join("")}
    </div>
  );
}
