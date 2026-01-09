import axiosClient from "../../services/axiosClient";
import { UploadSingleResponse, UploadMultipleResponse } from "./types";

/**
 * Upload a single PDF or image file to AWS S3
 * Maximum file size: 10MB
 */
export const uploadSingle = async (
  file: File,
  folder?: string
): Promise<UploadSingleResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (folder) {
    params.append("folder", folder);
  }

  const response = await axiosClient.post(
    `/uploads/single${params.toString() ? `?${params.toString()}` : ""}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Upload multiple PDF or image files to AWS S3
 * Maximum 10 files, 10MB each
 */
export const uploadMultiple = async (
  files: File[],
  folder?: string
): Promise<UploadMultipleResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const params = new URLSearchParams();
  if (folder) {
    params.append("folder", folder);
  }

  const response = await axiosClient.post(
    `/uploads/multiple${params.toString() ? `?${params.toString()}` : ""}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

/**
 * Delete a file from AWS S3 using its key
 */
export const deleteFile = async (key: string): Promise<void> => {
  const response = await axiosClient.delete(`/uploads/${encodeURIComponent(key)}`);
  return response.data;
}; 