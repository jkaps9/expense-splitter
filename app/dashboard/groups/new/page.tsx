import Link from "next/link";
import { createGroup } from "../actions";

export default function NewGroupPage() {
  return (
    <div className="container">
      <header>
        <Link href="/dashboard">← Back to Dashboard</Link>
        <h1>Create a New Group</h1>
      </header>

      <main>
        <form action={createGroup} className="form--modal">
          <div className="input-group">
            <label htmlFor="name">Group Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Summer Vacation"
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Keep track of all shared expenses..."
            ></textarea>
          </div>

          <div className="input-group">
            <label htmlFor="default_currency">Default Currency</label>
            <select name="default_currency" id="default_currency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>

          <button type="submit" className="btn">
            Create Group
          </button>
        </form>
      </main>
    </div>
  );
}
