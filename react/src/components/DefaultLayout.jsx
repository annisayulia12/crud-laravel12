import { useEffect, useState } from "react";
import {
  Outlet,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
  UsersIcon,
  FolderIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { Button, Tooltip } from "@heroui/react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function DefaultLayout() {
  const { user, token, notification, setUser, setToken } = useStateContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    axiosClient
      .get("/user")
      .then(({ data }) => {
        setUser(data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setUser({});
          setToken(null);
        }
      });
  }, [token, setUser, setToken]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const onLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await axiosClient.post("/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser({});
      setToken(null);
      setSidebarOpen(false);
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Squares2X2Icon,
    },
    {
      name: "Users",
      path: "/users",
      icon: UsersIcon,
    },
    {
      name: "Project",
      path: "/project",
      icon: FolderIcon,
    },
    {
      name: "Transaction",
      path: "/transaction",
      icon: WalletIcon,
    },
  ];

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <SparklesIcon className="size-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                My Dashboard
              </h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                    }`
                  }
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-5 text-white">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white/15">
              <SparklesIcon className="size-6" />
            </div>

            <h3 className="font-semibold">Welcome aboard!</h3>
            <p className="mt-2 text-xs leading-relaxed text-indigo-100">
              Manage your users and projects in one place.
            </p>
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {getInitial(user?.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.email || "Signed in"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-dvh lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <Bars3Icon className="size-6" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs text-slate-400 sm:text-sm">
                Workspace /{" "}
                <span className="font-medium text-indigo-600">
                  {menuItems.find((item) => item.path === location.pathname)
                    ?.name || "Page"}
                </span>
              </p>

              <h2 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-lg">
                Hello, {user?.name?.split(" ")[0] || "there"}!
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400">Account</p>
            </div>

            <div className="hidden size-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 sm:flex">
              {getInitial(user?.name)}
            </div>

            <Tooltip delay={0}>
              <Button
                isIconOnly
                variant="danger-soft"
                size="sm"
                aria-label={loggingOut ? "Logging out" : "Logout"}
                onPress={onLogout}
                isLoading={loggingOut}
                isDisabled={loggingOut}
              >
                <ArrowRightStartOnRectangleIcon className="size-5" />
              </Button>

              <Tooltip.Content showArrow placement="bottom">
                <Tooltip.Arrow />
                <p>Logout</p>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification */}
      {notification && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-60 max-w-[calc(100vw-2rem)] rounded-xl border border-indigo-100 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-xl sm:bottom-6 sm:right-6"
        >
          {notification}
        </div>
      )}
    </div>
  );
}
