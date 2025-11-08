import { Pagination } from "../clinics/types";

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetCategoriesResponse {
  data: Category[];
  pagination: Pagination;
}

export type GetCategoryByIdResponse = Category;

export interface CategoryRequestBody {
  name: string;
  description?: string;
}