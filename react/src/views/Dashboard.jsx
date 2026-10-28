import { useEffect, useState } from "react";
import {
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const dateFormat = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setNotification } = useStateContext();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [projectResponse, transactionResponse] = await Promise.all([
          axiosClient.get("/project"),
          axiosClient.get("/transactions"),
        ]);

        const projectData = projectResponse.data;
        const transactionData = transactionResponse.data;

        setProjects(
          Array.isArray(projectData)
            ? projectData
            : Array.isArray(projectData.data)
              ? projectData.data
              : [],
        );

        setTransactions(
          Array.isArray(transactionData)
            ? transactionData
            : Array.isArray(transactionData.data)
              ? transactionData.data
              : [],
        );
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setNotification("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const income = transactions
    .filter((item) => item.type?.toLowerCase() === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const expense = transactions
    .filter((item) => item.type?.toLowerCase() === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const balance = income - expense;

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = new Date(a.transaction_date || a.created_at || 0).getTime();

      const dateB = new Date(b.transaction_date || b.created_at || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const cards = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderIcon,
      color: "bg-indigo-50 text-indigo-600",
      format: false,
    },
    {
      title: "Total Income",
      value: income,
      icon: ArrowTrendingUpIcon,
      color: "bg-emerald-50 text-emerald-600",
      format: true,
    },
    {
      title: "Total Expense",
      value: expense,
      icon: ArrowTrendingDownIcon,
      color: "bg-rose-50 text-rose-600",
      format: true,
    },
    {
      title: "Net Balance",
      value: balance,
      icon: WalletIcon,
      color: "bg-blue-50 text-blue-600",
      format: true,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Heading */}
      <header>
        <p className="text-sm font-medium text-indigo-600">OVERVIEW</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor your projects and financial activities in one place.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 wrap-break-word text-xl font-bold text-slate-900 sm:text-2xl">
                    {loading
                      ? "..."
                      : card.format
                        ? rupiah(card.value)
                        : card.value}
                  </p>
                </div>

                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest financial activities
            </p>
          </div>

          <ClockIcon className="size-5 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <ArrowPathIcon className="size-5 animate-spin text-indigo-600" />
            <span className="text-sm text-slate-500">Loading dashboard...</span>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <WalletIcon className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">
              No transactions yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Your recent transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((transaction, index) => {
              const isIncome = transaction.type?.toLowerCase() === "income";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>

                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowTrendingUpIcon className="size-5" />
                    ) : (
                      <ArrowTrendingDownIcon className="size-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {transaction.title || "Untitled transaction"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {dateFormat(
                        transaction.transaction_date || transaction.created_at,
                      )}
                      {" · "}
                      {isIncome ? "Income" : "Expense"}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-right text-sm font-semibold ${
                      isIncome ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {rupiah(transaction.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Projects */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">Your Projects</h2>
          <p className="mt-1 text-sm text-slate-500">
            A quick overview of your projects
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10">
            <ArrowPathIcon className="size-5 animate-spin text-indigo-600" />
            <span className="text-sm text-slate-500">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No projects available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FolderIcon className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-word font-semibold text-slate-800">
                      {project.name || "Untitled project"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Status: </span>
                  <span className="text-xs font-semibold capitalize text-indigo-600">
                    {(project.status || "unknown").replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
