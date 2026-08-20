import { apiClient } from "./client";
import type { BlogListResponse, BlogPost } from "@/lib/types/blog";

export const getAllBlogs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const res = await apiClient.get<BlogListResponse>("/blog", {
    params: { ...params, includeAll: true },
  });
  return res.data.data;
};

export const getBlogById = async (id: string) => {
  const res = await apiClient.get<{ success: boolean; data: BlogPost }>(
    `/blog/id/${id}`
  );
  return res.data.data;
};

export const createBlog = async (data: Partial<BlogPost>) => {
  const res = await apiClient.post<{ success: boolean; data: BlogPost }>(
    "/blog",
    data
  );
  return res.data.data;
};

export const updateBlog = async (id: string, data: Partial<BlogPost>) => {
  const res = await apiClient.patch<{ success: boolean; data: BlogPost }>(
    `/blog/${id}`,
    data
  );
  return res.data.data;
};

export const deleteBlog = async (id: string) => {
  await apiClient.delete(`/blog/${id}`);
};