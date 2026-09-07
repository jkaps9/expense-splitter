import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import "@styles/index.css";
import App from "@/App";

import AuthBase from "@routes/auth";
import Login from "@routes/auth/login";
import SignUp from "@routes/auth/signup";
import ResetPassword from "@routes/auth/reset-password";

import DashboardBase from "@routes/dashboard";
import UpdatePassword from "@routes/dashboard/update-password";

import GroupsBase from "@routes/groups";
import GroupDetails from "@/routes/groups/group-details";
import ManageGroup from "@routes/groups/manage-group";
import NewGroupMember from "@routes/groups/new-member";

import NewExpense from "@routes/expenses/new-expense";
import EditExpense from "@routes/expenses/edit-expense";

import AcceptInvite from "@routes/invite";

const router = createBrowserRouter([
  {
    path: `${import.meta.env.BASE_URL}`,
    Component: App,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "dashboard",
        Component: DashboardBase,
      },
      {
        path: "groups",
        Component: GroupsBase,
        children: [
          { path: "new", Component: ManageGroup },
          { path: ":id", Component: GroupDetails },
          { path: "edit/:id", Component: ManageGroup },
          { path: "new-member", Component: NewGroupMember },
        ],
      },
      {
        path: "expenses",
        children: [
          { path: "new", Component: NewExpense },
          { path: "edit/:id", Component: EditExpense },
        ],
      },
      { path: "update-password", Component: UpdatePassword },
    ],
  },
  {
    path: `${import.meta.env.BASE_URL}/auth`,
    Component: AuthBase,
    children: [
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
  {
    path: `${import.meta.env.BASE_URL}/invite/:token`,
    Component: AcceptInvite,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
