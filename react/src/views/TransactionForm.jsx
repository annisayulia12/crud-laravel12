import { useEffect, useState } from "react";
import {
  XMarkIcon,
  PencilSquareIcon,
  PlusIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Button, Input, Label, Select, TextArea } from "@heroui/react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

const initialForm = {
  id: null,
  project_id: "",
  title: "",
  type: "income",
  category: "",
  amount: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  description: "",
};

export default function TransactionForm({
  transactionId,
  projects = [],
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [transaction, setTransaction] = useState(initialForm);

  const { setNotification } = useStateContext();

  useEffect(() => {
    let active = true;

    if (!transactionId) {
      setTransaction({
        ...initialForm,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      setErrors({});
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setErrors({});

    axiosClient
      .get(`/transactions/${transactionId}`)
      .then(({ data }) => {
        if (!active) return;

        const result = data.data ?? data;

        setTransaction({
          id: result.id,
          project_id: String(result.project_id ?? ""),
          title: result.title ?? "",
          type: result.type ?? "income",
          category: result.category ?? "",
          amount: result.amount ?? "",
          transaction_date: result.transaction_date
            ? String(result.transaction_date).slice(0, 10)
            : "",
          description: result.description ?? "",
        });
      })
      .catch((err) => {
        if (!active) return;

        console.error("Failed to fetch transaction:", err);
        setNotification("Gagal mengambil data transaksi");
        onClose();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [transactionId]);

  const updateField = (field, value) => {
    setTransaction((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.general;
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const payload = {
      project_id: Number(transaction.project_id),
      title: transaction.title.trim(),
      type: transaction.type,
      category: transaction.category.trim() || null,
      amount: Number(transaction.amount),
      transaction_date: transaction.transaction_date,
      description: transaction.description.trim() || null,
    };

    try {
      if (transactionId) {
        await axiosClient.put(`/transactions/${transactionId}`, payload);
      } else {
        await axiosClient.post("/transactions", payload);
      }

      setNotification(
        transactionId
          ? "Transaksi berhasil diperbarui"
          : "Transaksi berhasil ditambahkan",
      );

      onClose(true);
    } catch (err) {
      const response = err.response;

      if (response?.status === 422) {
        setErrors(
          response.data.errors ?? {
            general: [
              response.data.message || "Periksa kembali data yang diisi.",
            ],
          },
        );
      } else {
        setErrors({
          general: [
            response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.",
          ],
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const getFieldError = (field) => {
    const value = errors[field];
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  };

  const generalErrors = Object.entries(errors)
    .filter(([key]) => key === "general")
    .flatMap(([, messages]) =>
      Array.isArray(messages) ? messages : [messages],
    );

  const fieldErrors = Object.entries(errors).filter(
    ([key]) => key !== "general",
  );

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-3xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              {transactionId ? (
                <PencilSquareIcon className="size-6" />
              ) : (
                <PlusIcon className="size-6" />
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="transaction-form-title"
                className="text-lg font-bold text-slate-900 sm:text-xl"
              >
                {transactionId ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {transactionId
                  ? "Update your transaction details."
                  : "Fill in the details of your transaction."}
              </p>
            </div>
          </div>

          <Button
            isIconOnly
            variant="outline"
            aria-label="Close modal"
            isDisabled={saving}
            onPress={() => onClose()}
            className="shrink-0 text-slate-500"
          >
            <XMarkIcon className="size-5" />
          </Button>
        </div>

        {/* Form body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <div className="size-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading transaction information...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="max-h-[65dvh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              {(generalErrors.length > 0 || fieldErrors.length > 0) && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0" />

                    <div className="min-w-0 space-y-1">
                      {generalErrors.map((message, index) => (
                        <p key={`general-${index}`}>{message}</p>
                      ))}

                      {fieldErrors.map(([key, messages]) => (
                        <p key={key}>
                          {Array.isArray(messages) ? messages[0] : messages}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Project */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <FolderIcon className="size-4 text-slate-400" />
                  Project
                </Label>

                <select
                  aria-label="Project"
                  value={transaction.project_id}
                  onChange={(e) => updateField("project_id", e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                {getFieldError("project_id") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("project_id")}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <DocumentTextIcon className="size-4 text-slate-400" />
                  Transaction Title
                </Label>

                <Input
                  aria-label="Transaction title"
                  placeholder="e.g. Monthly salary"
                  value={transaction.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  className="w-full"
                />

                {getFieldError("title") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("title")}
                  </p>
                )}
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Transaction Type
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={
                      transaction.type === "income" ? "solid" : "outline"
                    }
                    onPress={() => updateField("type", "income")}
                    className={`w-full font-semibold ${
                      transaction.type === "income"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowTrendingUpIcon className="size-5" />
                    Income
                  </Button>

                  <Button
                    type="button"
                    variant={
                      transaction.type === "expense" ? "solid" : "outline"
                    }
                    onPress={() => updateField("type", "expense")}
                    className={`w-full font-semibold ${
                      transaction.type === "expense"
                        ? "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowTrendingDownIcon className="size-5" />
                    Expense
                  </Button>
                </div>

                {getFieldError("type") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("type")}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <TagIcon className="size-4 text-slate-400" />
                  Category
                </Label>

                <Input
                  aria-label="Category"
                  placeholder="e.g. Food, Salary, Transport"
                  value={transaction.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full"
                />

                {getFieldError("category") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("category")}
                  </p>
                )}
              </div>

              {/* Amount and date */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CurrencyDollarIcon className="size-4 text-slate-400" />
                    Amount
                  </Label>

                  <Input
                    aria-label="Amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={transaction.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    required
                    className="w-full"
                  />

                  {getFieldError("amount") && (
                    <p className="text-sm text-red-600">
                      {getFieldError("amount")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CalendarDaysIcon className="size-4 text-slate-400" />
                    Transaction Date
                  </Label>

                  <Input
                    aria-label="Transaction date"
                    type="date"
                    value={transaction.transaction_date}
                    onChange={(e) =>
                      updateField("transaction_date", e.target.value)
                    }
                    required
                    className="w-full"
                  />

                  {getFieldError("transaction_date") && (
                    <p className="text-sm text-red-600">
                      {getFieldError("transaction_date")}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Description
                </Label>

                <textarea
                  aria-label="Description"
                  placeholder="Add transaction details (optional)"
                  value={transaction.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                {getFieldError("description") && (
                  <p className="text-sm text-red-600">
                    {getFieldError("description")}
                  </p>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <Button
                type="button"
                variant="outline"
                isDisabled={saving}
                onPress={() => onClose()}
                className="w-full font-semibold sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                color="primary"
                isLoading={saving}
                isDisabled={saving}
                className="w-full bg-indigo-600 font-semibold text-white sm:w-auto"
                startContent={!saving && <PlusIcon className="size-4" />}
              >
                {saving
                  ? "Saving..."
                  : transactionId
                    ? "Save Changes"
                    : "Create Transaction"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
