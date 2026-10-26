import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { Button, Input, Label } from "@heroui/react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function Signup() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const { setUser, setToken } = useStateContext();

  const onSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: confirmPasswordRef.current.value,
    };

    setErrors(null);
    setLoading(true);

    axiosClient
      .post("/signup", payload)
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.token);
      })
      .catch((err) => {
        const response = err.response;

        if (response?.status === 422) {
          setErrors(
            response.data.errors ?? {
              general: [response.data.message || "Pendaftaran gagal."],
            },
          );
        } else {
          setErrors({
            general: [
              response?.data?.message ||
                "Terjadi kesalahan. Silakan coba lagi.",
            ],
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-linear-to-br from-indigo-50 via-white to-violet-100 px-4 py-6 sm:px-6 sm:py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-indigo-100/50 sm:rounded-3xl sm:p-8 md:p-10">
        <div className="mb-7 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-200 sm:size-14 sm:text-2xl">
            P
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create an account
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Sign up to get started with your account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {errors && (
            <div
              role="alert"
              className="wrap-break-word rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {Object.entries(errors).flatMap(([key, messages]) =>
                (Array.isArray(messages) ? messages : [messages]).map(
                  (message, index) => <p key={`${key}-${index}`}>{message}</p>,
                ),
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              ref={nameRef}
              id="signup-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="signup-email">Email Address</Label>
            <Input
              ref={emailRef}
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              ref={passwordRef}
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
            <Input
              ref={confirmPasswordRef}
              id="signup-confirm-password"
              name="password_confirmation"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            isDisabled={loading}
            className="w-full bg-indigo-600 font-semibold text-white"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="my-6 border-t border-gray-100" />

        <p className="text-center text-sm leading-relaxed text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
