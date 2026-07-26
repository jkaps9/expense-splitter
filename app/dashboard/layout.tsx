import { signOut } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header>
        <div className="container row">
          <p>Hey, [DisplayName]</p>
          <form action={signOut} className="btn-form">
            <button className="btn" type="submit">
              Logout
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
