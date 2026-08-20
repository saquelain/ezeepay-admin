"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export const useHydrateAuth = () => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      hydrate();
    }
  }, [hasHydrated, hydrate]);

  return hasHydrated;
};