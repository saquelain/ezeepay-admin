import { apiClient } from "./client";
import type { ManagedUser, UserRole, UserStatus } from "@/lib/types/auth";

export const getAllUsers = async () => {
  const res = await apiClient.get<{ success: boolean; data: ManagedUser[] }>(
    "/users"
  );
  return res.data.data;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  const res = await apiClient.post<{ success: boolean; data: ManagedUser }>(
    "/users",
    data
  );
  return res.data.data;
};

export const updateUser = async (
  id: string,
  data: Partial<{
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }>
) => {
  const res = await apiClient.patch<{ success: boolean; data: ManagedUser }>(
    `/users/${id}`,
    data
  );
  return res.data.data;
};

export const deleteUser = async (id: string) => {
  await apiClient.delete(`/users/${id}`);
};