"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { token, user } = await login(email, password);
      setUser(user, token);
      router.push("/blog");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-brand-purple/10 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-brand-purple-dark">
            Ezeepay Admin
          </h1>
          <p className="mt-1.5 text-sm text-brand-grey">
            Sign in to manage blog content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-brand-purple-dark"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-grey/60"
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ezeepay.app"
                className="w-full rounded-xl border border-brand-purple/15 bg-white py-3 pl-10 pr-4 text-[15px] text-brand-purple-dark placeholder:text-brand-grey/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-brand-purple-dark"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-grey/60"
              />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-purple/15 bg-white py-3 pl-10 pr-4 text-[15px] text-brand-purple-dark placeholder:text-brand-grey/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-purple-dark px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-purple disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}