import client from "../../services/axiosClient";
import {
  Laborzettel,
  CreateLaborzettelDto,
  UpdateLaborzettelDto,
} from "./types";

export interface LaborzettelListResponse {
  data: Laborzettel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetLaborzettelParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  operation?: string;
  doctor?: string;
  labTechnician?: string;
}

// Get all Laborzettel with pagination
export const getAllLaborzettel = async (
  params: GetLaborzettelParams = {},
): Promise<LaborzettelListResponse> => {
  const response = await client.get<LaborzettelListResponse>("/laborzettel", {
    params,
  });
  return response.data;
};

// Create a new Laborzettel
export const createLaborzettel = async (
  data: CreateLaborzettelDto,
): Promise<Laborzettel> => {
  const response = await client.post<Laborzettel>("/laborzettel", data);
  return response.data;
};

// Get Laborzettel by lab request ID
export const getLaborzettelByLabRequest = async (
  labRequestId: string,
): Promise<Laborzettel | null> => {
  const response = await client.get<Laborzettel | null>(
    `/laborzettel/lab-request/${labRequestId}`,
  );
  return response.data;
};

// Get Laborzettel by ID
export const getLaborzettelById = async (id: string): Promise<Laborzettel> => {
  const response = await client.get<Laborzettel>(`/laborzettel/${id}`);
  return response.data;
};

// Update Laborzettel
export const updateLaborzettel = async (
  id: string,
  data: UpdateLaborzettelDto,
): Promise<Laborzettel> => {
  const response = await client.patch<Laborzettel>(`/laborzettel/${id}`, data);
  return response.data;
};

// Delete Laborzettel
export const deleteLaborzettel = async (id: string): Promise<void> => {
  await client.delete(`/laborzettel/${id}`);
};
