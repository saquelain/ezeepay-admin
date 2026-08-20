import { apiClient } from "./client";
import type { LoginResponse, AdminUser } from "@/lib/types/auth";

export const login = async (email: string, password: string) => {
  const res = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return res.data.data; // { token, user }
};

export const getMe = async () => {
  const res = await apiClient.get<{ success: boolean; data: AdminUser }>(
    "/auth/me"
  );
  return res.data.data;
};