import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
  GetCategoriesResponse,
  GetCategoryByIdResponse,
} from "./types";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  GetCategoriesParams,
} from "./requests";

// Create Category
export const useCreateCategory = (): UseMutationResult<
  Category,
  AxiosError,
  CreateCategoryDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createCategory(data),
  });
};

// Get all Categories with pagination and sorting
export const useGetCategories = (
  params: GetCategoriesParams = {}
): UseQueryResult<GetCategoriesResponse> => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params),
  });
};

// Get Category by ID
export const useGetCategoryById = (
  categoryId: string
): UseQueryResult<GetCategoryByIdResponse> => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};

// Update Category
export const useUpdateCategory = (): UseMutationResult<
  Category,
  AxiosError,
  { categoryId: string; data: UpdateCategoryDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ categoryId, data }) => updateCategory(categoryId, data),
  });
};

// Delete Category
export const useDeleteCategory = (): UseMutationResult<
  Category,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (categoryId) => deleteCategory(categoryId),
  });
};


