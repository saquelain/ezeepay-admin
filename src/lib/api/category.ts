import { apiClient } from "./client";
import type { Category } from "@/lib/types/blog";

export const getAllCategories = async () => {
  const res = await apiClient.get<{ success: boolean; data: Category[] }>(
    "/categories"
  );
  return res.data.data;
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
}) => {
  const res = await apiClient.post<{ success: boolean; data: Category }>(
    "/categories",
    data
  );
  return res.data.data;
};

export const updateCategory = async (
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    order: number;
    isActive: boolean;
  }>
) => {
  const res = await apiClient.patch<{ success: boolean; data: Category }>(
    `/categories/${id}`,
    data
  );
  return res.data.data;
};

export const deleteCategory = async (id: string) => {
  await apiClient.delete(`/categories/${id}`);
};