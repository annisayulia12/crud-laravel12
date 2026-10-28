import Login from "./views/Login";
import Signup from "./views/Signup";
import Users from "./views/Users";
import NotFound from "./views/NotFound";
import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "./components/Defaultlayout";
import GuestLayout from "./components/GuestLayout";
import Dashboard from "./views/Dashboard";
import UserForm from "./views/UserForm";
import Project from "./views/Project";
import Transactions from "./views/Transaction";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/Dashboard" />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/users/new",
        element: <UserForm key="userCreate" />,
      },
      {
        path: "/users/:id",
        element: <UserForm key="userUpdate" />,
      },
      {
        path: "/project",
        element: <Project />,
      },
      {
        path: "/transaction",
        element: <Transactions />,
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
export default router;
