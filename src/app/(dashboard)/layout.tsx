"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/auth.store";
import { useHydrateAuth } from "@/hooks/useHydrateAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasHydrated = useHydrateAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Wait for hydration before rendering anything — avoids a flash of
  // "redirecting to login" for users who actually have a valid session
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-purple-light/30">
        <Loader2 size={28} className="animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect is in-flight via the effect above
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7FC]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}