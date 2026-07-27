import { signOut } from "./actions";
// TODO: figure out how to get user and pass up/down between layout and page
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
