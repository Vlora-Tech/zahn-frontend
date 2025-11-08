import { Pagination } from "../clinics/types";

export interface CreateMaterialDto {
  name: string;
  image?: string;
  description?: string;
  operations?: string[];
}

export interface UpdateMaterialDto {
  name?: string;
  image?: string;
  description?: string;
  operations?: string[];
}

export interface Material {
  _id: string;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetMaterialsResponse {
  data: Material[];
  pagination: Pagination;
}

export type GetMaterialByIdResponse = Material;

export interface MaterialRequestBody {
  name: string;
  image?: string;
  description?: string;
  operations?: string[];
}
