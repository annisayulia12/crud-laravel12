import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import {
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import TransactionForm from "./TransactionForm";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const dateFormat = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { setNotification } = useStateContext();

  const loadData = async () => {
    setLoading(true);

    try {
      const [transactionResponse, projectResponse] = await Promise.all([
        axiosClient.get("/transactions"),
        axiosClient.get("/project"),
      ]);

      const transactionData = transactionResponse.data;
      const projectData = projectResponse.data;

      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : transactionData.data || [],
      );

      setProjects(
        Array.isArray(projectData) ? projectData : projectData.data || [],
      );
    } catch (error) {
      console.error(error);
      setNotification("Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const income = transactions
    .filter((item) => item.type?.toLowerCase() === "income")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const expense = transactions
    .filter((item) => item.type?.toLowerCase() === "expense")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const balance = income - expense;

  const projectName = (transaction) => {
    if (transaction.project?.name) return transaction.project.name;

    return (
      projects.find(
        (project) => Number(project.id) === Number(transaction.project_id),
      )?.name || "Project"
    );
  };

  const openAdd = () => {
    setTransactionId(null);
    setShowModal(true);
  };

  const openEdit = (id) => {
    setTransactionId(id);
    setShowModal(true);
  };

  const handleDelete = async (transaction) => {
    if (
      !window.confirm(
        `Hapus transaksi "${transaction.title || transaction.description || "Transaksi"}"?`,
      )
    ) {
      return;
    }

    setDeletingId(transaction.id);

    try {
      await axiosClient.delete(`/transactions/${transaction.id}`);
      setNotification("Transaksi berhasil dihapus.");
      await loadData();
    } catch (error) {
      console.error(error);
      setNotification("Gagal menghapus transaksi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Heading */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track income and expenses across your projects.
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          title="Total Income"
          amount={income}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          iconStyle="bg-emerald-50 text-emerald-600"
          amountStyle="text-emerald-700 font-semibold"
        />

        <SummaryCard
          title="Total Expense"
          amount={expense}
          icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
          iconStyle="bg-rose-50 text-rose-600"
          amountStyle="text-rose-700 font-semibold"
        />

        <SummaryCard
          title="Net Balance"
          amount={balance}
          icon={<WalletIcon className="h-6 w-6" />}
          iconStyle="bg-blue-50 text-blue-600"
          amountStyle="text-gray-900 font-semibold"
        />
      </div>

      {/* Recent Transactions */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your latest project transactions
            </p>
          </div>

          <Button
            color="primary"
            onPress={openAdd}
            className="w-full bg-indigo-600 font-semibold text-white shadow-md shadow-indigo-100 sm:w-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Add Transaction
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-12">
              <ArrowPathIcon className="size-5 animate-spin text-indigo-600" />
              <span className="text-sm text-slate-500">
                Loading transactions...
              </span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <WalletIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 font-medium text-gray-800">
                No transactions yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add your first transaction to see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction, index) => {
                const isIncome = transaction.type?.toLowerCase() === "income";

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-800">
                      {index + 1}
                    </div>

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowTrendingUpIcon className="h-6 w-6" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-6 w-6" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {transaction.title || "Untitled transaction"}
                      </h3>

                      {transaction.description && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {transaction.description}
                        </p>
                      )}

                      <p className="mt-2 truncate text-sm text-gray-500">
                        {projectName(transaction)}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        {dateFormat(
                          transaction.transaction_date ||
                            transaction.created_at,
                        )}{" "}
                        ·{" "}
                        <span
                          className={
                            isIncome
                              ? "font-medium text-emerald-700"
                              : "font-medium text-rose-700"
                          }
                        >
                          {isIncome ? "Income" : "Expense"}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <p
                        className={`whitespace-nowrap text-base font-semibold ${
                          isIncome ? "text-emerald-600" : "text-rose-700"
                        }`}
                      >
                        {isIncome ? "+" : "−"}
                        {rupiah(transaction.amount)}
                      </p>

                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => openEdit(transaction.id)}
                        >
                          <PencilSquareIcon className="size-4 text-yellow-500" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="flat"
                          color="danger"
                          isDisabled={deletingId === transaction.id}
                          isLoading={deletingId === transaction.id}
                          onPress={() => handleDelete(transaction)}
                        >
                          <TrashIcon className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Ilustrasi tampilan — angka dan transaksi contoh.
        </p>
      </section>

      {showModal && (
        <TransactionForm
          transactionId={transactionId}
          projects={projects}
          onClose={() => {
            setShowModal(false);
            setTransactionId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, amount, icon, iconStyle, amountStyle }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-5 wrap-break-word text-2xl font-bold tracking-tight sm:text-3xl ${amountStyle}`}
      >
        {rupiah(amount)}
      </p>
    </div>
  );
}
