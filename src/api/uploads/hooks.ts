import {
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  UploadSingleResponse,
  UploadMultipleResponse,
} from "./types";
import {
  uploadSingle,
  uploadMultiple,
  deleteFile,
} from "./requests";

// Upload single file
export const useUploadSingle = (): UseMutationResult<
  UploadSingleResponse,
  AxiosError,
  { file: File; folder?: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ file, folder }) => uploadSingle(file, folder),
  });
};

// Upload multiple files
export const useUploadMultiple = (): UseMutationResult<
  UploadMultipleResponse,
  AxiosError,
  { files: File[]; folder?: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ files, folder }) => uploadMultiple(files, folder),
  });
};

// Delete file
export const useDeleteFile = (): UseMutationResult<
  void,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (key: string) => deleteFile(key),
  });
}; 