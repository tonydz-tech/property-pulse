"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "./actions";

export default function SignupPage() {
  const [error, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-ink">Property Pulse</h1>
          <p className="mt-1 text-sm text-ink/60">
            Create your landlord account.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-ink"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ink"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full border-b border-hairline bg-transparent py-2 text-ink outline-none focus:border-moss"
            />
            <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-moss py-2.5 text-sm font-medium text-paper transition hover:bg-ink disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="text-moss hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
