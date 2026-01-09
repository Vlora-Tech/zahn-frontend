import client from "../../services/axiosClient";
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  Material,
  GetMaterialsResponse,
  GetMaterialByIdResponse,
} from "./types";

export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  operation?: string;
}

// Create material
export const createMaterial = async (
  data: CreateMaterialDto
): Promise<Material> => {
  const response = await client.post<Material>("/materials", data);
  return response.data;
};

// Get all materials with pagination, sorting, and filtering
export const getMaterials = async (
  params: GetMaterialsParams = {}
): Promise<GetMaterialsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.operation) queryParams.append("operation", params.operation);

  const url = `/materials${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetMaterialsResponse>(url);
  return response.data;
};

// Get material by ID
export const getMaterialById = async (
  materialId: string
): Promise<GetMaterialByIdResponse> => {
  const response = await client.get<GetMaterialByIdResponse>(`/materials/${materialId}`);
  return response.data;
};

// Update material
export const updateMaterial = async (
  materialId: string,
  data: UpdateMaterialDto
): Promise<Material> => {
  const response = await client.patch<Material>(`/materials/${materialId}`, data);
  return response.data;
};

// Delete material
export const deleteMaterial = async (
  materialId: string
): Promise<Material> => {
  const response = await client.delete<Material>(`/materials/${materialId}`);
  return response.data;
};
