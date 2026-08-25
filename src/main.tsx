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
import GroupDetails from "@routes/dashboard/groups/[id]/index";

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
      { path: "dashboard/groups/:id", Component: GroupDetails },
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
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
