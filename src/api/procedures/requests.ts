import client from "../../services/axiosClient";
import {
  CreateProcedureDto,
  UpdateProcedureDto,
  Procedure,
  GetProceduresResponse,
  GetProcedureByIdResponse,
} from "./types";

export interface GetProceduresParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Create procedure
export const createProcedure = async (
  data: CreateProcedureDto,
): Promise<Procedure> => {
  const response = await client.post<Procedure>("/procedures", data);
  return response.data;
};

// Get all procedures with pagination and sorting
export const getProcedures = async (
  params: GetProceduresParams = {},
): Promise<GetProceduresResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const url = `/procedures${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetProceduresResponse>(url);
  return response.data;
};

// Get procedure by ID
export const getProcedureById = async (
  procedureId: string,
): Promise<GetProcedureByIdResponse> => {
  const response = await client.get<GetProcedureByIdResponse>(
    `/procedures/${procedureId}`,
  );
  return response.data;
};

// Update procedure
export const updateProcedure = async (
  procedureId: string,
  data: UpdateProcedureDto,
): Promise<Procedure> => {
  const response = await client.patch<Procedure>(
    `/procedures/${procedureId}`,
    data,
  );
  return response.data;
};

// Delete procedure
export const deleteProcedure = async (
  procedureId: string,
): Promise<Procedure> => {
  const response = await client.delete<Procedure>(`/procedures/${procedureId}`);
  return response.data;
};

// Get procedure count
export const getProcedureCount = async (): Promise<number> => {
  const response = await client.get<number>("/procedures/count");
  return response.data;
};
