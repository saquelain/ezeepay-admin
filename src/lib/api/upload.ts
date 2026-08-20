import { apiClient } from "./client";

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiClient.post<{
    success: boolean;
    data: { key: string; url: string };
  }>("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.data.url;
};