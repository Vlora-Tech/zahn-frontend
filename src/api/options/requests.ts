import client from "../../services/axiosClient";
import {
  CreateOptionDto,
  UpdateOptionDto,
  Option,
  GetOptionsResponse,
  GetOptionByIdResponse,
  GetOptionTypesResponse,
} from "./types";

export interface GetOptionsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  operation?: string;
  material?: string;
  type?: "selection" | "input";
}

// Create option
export const createOption = async (
  data: CreateOptionDto
): Promise<Option> => {
  const response = await client.post<Option>("/options", data);
  return response.data;
};

// Get all options with pagination, sorting, and filtering
export const getOptions = async (
  params: GetOptionsParams = {}
): Promise<GetOptionsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.operation) queryParams.append("operation", params.operation);
  if (params.material) queryParams.append("material", params.material);
  if (params.type) queryParams.append("type", params.type);

  const url = `/options${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetOptionsResponse>(url);
  return response.data;
};

// Get option types
export const getOptionTypes = async (): Promise<GetOptionTypesResponse> => {
  const response = await client.get<GetOptionTypesResponse>("/options/types");
  return response.data;
};

// Get option by ID
export const getOptionById = async (
  optionId: string
): Promise<GetOptionByIdResponse> => {
  const response = await client.get<GetOptionByIdResponse>(`/options/${optionId}`);
  return response.data;
};

// Update option
export const updateOption = async (
  optionId: string,
  data: UpdateOptionDto
): Promise<Option> => {
  const response = await client.patch<Option>(`/options/${optionId}`, data);
  return response.data;
};

// Delete option
export const deleteOption = async (
  optionId: string
): Promise<Option> => {
  const response = await client.delete<Option>(`/options/${optionId}`);
  return response.data;
};

// Add value to option
export const addValueToOption = async (
  optionId: string,
  value: string
): Promise<Option> => {
  const response = await client.patch<Option>(`/options/${optionId}/values/${encodeURIComponent(value)}`);
  return response.data;
};

// Remove value from option
export const removeValueFromOption = async (
  optionId: string,
  value: string
): Promise<Option> => {
  const response = await client.delete<Option>(`/options/${optionId}/values/${encodeURIComponent(value)}`);
  return response.data;
};
