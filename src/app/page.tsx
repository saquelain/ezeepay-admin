"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useHydrateAuth } from "@/hooks/useHydrateAuth";

export default function RootPage() {
  const router = useRouter();
  const hasHydrated = useHydrateAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(isAuthenticated ? "/blog" : "/login");
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-purple-light/30">
      <Loader2 size={28} className="animate-spin text-brand-purple" />
    </div>
  );
}