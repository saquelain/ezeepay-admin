import { create } from "zustand";
import Cookies from "js-cookie";
import type { AdminUser } from "@/lib/types/auth";

type AuthState = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: AdminUser, token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasHydrated: false,

  setUser: (user, token) => {
    Cookies.set("ezeepay_admin_token", token, { expires: 7 });
    Cookies.set("ezeepay_admin_user", JSON.stringify(user), { expires: 7 });
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove("ezeepay_admin_token");
    Cookies.remove("ezeepay_admin_user");
    set({ user: null, isAuthenticated: false });
  },

  // Called once on app mount to restore session from cookies
  hydrate: () => {
    const token = Cookies.get("ezeepay_admin_token");
    const userStr = Cookies.get("ezeepay_admin_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AdminUser;
        set({ user, isAuthenticated: true, hasHydrated: true });
      } catch {
        set({ hasHydrated: true });
      }
    } else {
      set({ hasHydrated: true });
    }
  },
}));