import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <div className="container" style={{ marginBlock: "2rem" }}>
          <AuthButton></AuthButton>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
