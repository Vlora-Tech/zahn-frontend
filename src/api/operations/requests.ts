
import client from "../../services/axiosClient";
import {
  CreateOperationDto,
  UpdateOperationDto,
  Operation,
  GetOperationsResponse,
  GetOperationByIdResponse,
  GetOperationCategoriesResponse,
  Material,
  Option,
} from "./types";

export interface GetOperationsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  category?: string;
}

// Create operation
export const createOperation = async (
  data: CreateOperationDto
): Promise<Operation> => {
  const response = await client.post<Operation>("/operations", data);
  return response.data;
};

// Get all operations with pagination, sorting, and filtering
export const getOperations = async (
  params: GetOperationsParams = {}
): Promise<GetOperationsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.category) queryParams.append("category", params.category);

  const url = `/operations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetOperationsResponse>(url);
  return response.data;
};

// Get operation categories
export const getOperationCategories = async (): Promise<GetOperationCategoriesResponse> => {
  const response = await client.get<GetOperationCategoriesResponse>("/operations/categories");
  return response.data;
};

// Get operation by ID
export const getOperationById = async (
  operationId: string
): Promise<GetOperationByIdResponse> => {
  const response = await client.get<GetOperationByIdResponse>(`/operations/${operationId}`);
  return response.data;
};

// Update operation
export const updateOperation = async (
  operationId: string,
  data: UpdateOperationDto
): Promise<Operation> => {
  const response = await client.patch<Operation>(`/operations/${operationId}`, data);
  return response.data;
};

// Delete operation
export const deleteOperation = async (
  operationId: string
): Promise<Operation> => {
  const response = await client.delete<Operation>(`/operations/${operationId}`);
  return response.data;
};

// Get materials for operation
export const getMaterialsForOperation = async (
  operationId: string
): Promise<Material[]> => {
  const response = await client.get<Material[]>(`/operations/${operationId}/materials`);
  return response.data;
};

// Get options for operation
export const getOptionsForOperation = async (
  operationId: string
): Promise<Option[]> => {
  const response = await client.get<Option[]>(`/operations/${operationId}/options`);
  return response.data;
};

// Add material to operation
export const addMaterialToOperation = async (
  operationId: string,
  materialId: string
): Promise<Operation> => {
  const response = await client.patch<Operation>(`/operations/${operationId}/materials/${materialId}`);
  return response.data;
};

// Remove material from operation
export const removeMaterialFromOperation = async (
  operationId: string,
  materialId: string
): Promise<Operation> => {
  const response = await client.delete<Operation>(`/operations/${operationId}/materials/${materialId}`);
  return response.data;
};

// Add option to operation
export const addOptionToOperation = async (
  operationId: string,
  optionId: string
): Promise<Operation> => {
  const response = await client.patch<Operation>(`/operations/${operationId}/options/${optionId}`);
  return response.data;
};

// Remove option from operation
export const removeOptionFromOperation = async (
  operationId: string,
  optionId: string
): Promise<Operation> => {
  const response = await client.delete<Operation>(`/operations/${operationId}/options/${optionId}`);
  return response.data;
};