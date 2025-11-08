import client from "../../services/axiosClient";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
  GetCategoriesResponse,
  GetCategoryByIdResponse,
} from "./types";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Create category
export const createCategory = async (
  data: CreateCategoryDto
): Promise<Category> => {
  const response = await client.post<Category>("/categories", data);
  return response.data;
};

// Get all categories with pagination and sorting
export const getCategories = async (
  params: GetCategoriesParams = {}
): Promise<GetCategoriesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const url = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetCategoriesResponse>(url);
  return response.data;
};

// Get category by ID
export const getCategoryById = async (
  categoryId: string
): Promise<GetCategoryByIdResponse> => {
  const response = await client.get<GetCategoryByIdResponse>(`/categories/${categoryId}`);
  return response.data;
};

// Update category
export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryDto
): Promise<Category> => {
  const response = await client.patch<Category>(`/categories/${categoryId}`, data);
  return response.data;
};

// Delete category
export const deleteCategory = async (
  categoryId: string
): Promise<Category> => {
  const response = await client.delete<Category>(`/categories/${categoryId}`);
  return response.data;
};