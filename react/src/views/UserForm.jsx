import { useEffect, useState } from "react";
import {
  XMarkIcon,
  UserPlusIcon,
  PencilSquareIcon,
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button, Input, Label } from "@heroui/react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function UserForm({ userId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { setNotification } = useStateContext();

  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    let active = true;

    if (!userId) {
      setUser({
        id: null,
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      });
      setErrors({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors({});

    axiosClient
      .get(`/users/${userId}`)
      .then(({ data }) => {
        if (!active) return;

        const result = data.data ?? data;

        setUser({
          id: result.id,
          name: result.name ?? "",
          email: result.email ?? "",
          password: "",
          password_confirmation: "",
        });
      })
      .catch((err) => {
        if (!active) return;

        console.error("Failed to fetch user:", err);
        setNotification("Gagal mengambil data user");
        onClose();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const updateField = (field, value) => {
    setUser((prev) => ({
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
      name: user.name,
      email: user.email,
    };

    if (!userId || user.password) {
      payload.password = user.password;
      payload.password_confirmation = user.password_confirmation;
    }

    try {
      if (userId) {
        await axiosClient.put(`/users/${userId}`, payload);
      } else {
        await axiosClient.post("/users", payload);
      }

      setNotification(
        userId ? "User berhasil diperbarui" : "User berhasil ditambahkan",
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
        aria-labelledby="user-form-title"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-3xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              {userId ? (
                <PencilSquareIcon className="size-6" />
              ) : (
                <UserPlusIcon className="size-6" />
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="user-form-title"
                className="text-lg font-bold text-slate-900 sm:text-xl"
              >
                {userId ? "Edit User" : "Add New User"}
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {userId
                  ? "Update the user's account information."
                  : "Fill in the details to create a new account."}
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
              Loading user information...
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

              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UserCircleIcon className="size-4 text-slate-400" />
                  Full Name
                </Label>

                <Input
                  aria-label="username"
                  placeholder="Enter full name"
                  value={user.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full"
                />

                {getFieldError("name") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("name")}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <EnvelopeIcon className="size-4 text-slate-400" />
                  Email Address
                </Label>

                <Input
                  aria-label="User email"
                  placeholder="name@example.com"
                  value={user.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full"
                />

                {getFieldError("email") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("email")}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LockClosedIcon className="size-4 text-slate-400" />
                  Password
                </Label>

                <Input
                  aria-label="Password"
                  type="password"
                  placeholder={
                    userId
                      ? "Leave blank to keep current password"
                      : "Create a password"
                  }
                  value={user.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  autoComplete="new-password"
                  className="w-full"
                />

                {getFieldError("password") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("password")}
                  </p>
                )}

                {userId && (
                  <p className="text-xs leading-relaxed text-slate-400">
                    Leave this field blank if you do not want to change the
                    password.
                  </p>
                )}
              </div>

              {/* Password confirmation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LockClosedIcon className="size-4 text-slate-400" />
                  Confirm Password
                </Label>

                <Input
                  aria-label="Confirmation Password"
                  type="password"
                  placeholder={
                    userId
                      ? "Leave blank to keep current password"
                      : "Re-enter password"
                  }
                  value={user.password_confirmation}
                  onChange={(e) =>
                    updateField("password_confirmation", e.target.value)
                  }
                  autoComplete="new-password"
                  className="w-full"
                />

                {getFieldError("password_confirmation") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("password_confirmation")}
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
                startContent={!saving && <UserPlusIcon className="size-4" />}
              >
                {saving ? "Saving..." : userId ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
