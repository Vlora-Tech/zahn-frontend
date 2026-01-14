import client from "../../services/axiosClient";
import {
  LaborzettelTemplate,
  CreateLaborzettelTemplateDto,
  UpdateLaborzettelTemplateDto,
  GetLaborzettelTemplatesResponse,
  GetLaborzettelTemplateByIdResponse,
  TemplateMatchQuery,
  PatientType,
  ImpressionType,
} from "./types";

export interface GetLaborzettelTemplatesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  operation?: string;
  patientType?: PatientType;
  impressionType?: ImpressionType;
  material?: string;
  isActive?: boolean;
}

// Create a new Laborzettel template
export const createLaborzettelTemplate = async (
  data: CreateLaborzettelTemplateDto,
): Promise<LaborzettelTemplate> => {
  const response = await client.post<LaborzettelTemplate>(
    "/laborzettel-templates",
    data,
  );
  return response.data;
};

// Get all Laborzettel templates with pagination and filtering
export const getLaborzettelTemplates = async (
  params: GetLaborzettelTemplatesParams = {},
): Promise<GetLaborzettelTemplatesResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);
  if (params.operation) queryParams.append("operation", params.operation);
  if (params.patientType) queryParams.append("patientType", params.patientType);
  if (params.impressionType)
    queryParams.append("impressionType", params.impressionType);
  if (params.material) queryParams.append("material", params.material);
  if (params.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());

  const url = `/laborzettel-templates${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetLaborzettelTemplatesResponse>(url);
  return response.data;
};

// Get Laborzettel template by ID
export const getLaborzettelTemplateById = async (
  id: string,
): Promise<GetLaborzettelTemplateByIdResponse> => {
  const response = await client.get<GetLaborzettelTemplateByIdResponse>(
    `/laborzettel-templates/${id}`,
  );
  return response.data;
};

// Find matching template by operation, patient type, impression type, and material
export const findMatchingTemplate = async (
  query: TemplateMatchQuery,
): Promise<LaborzettelTemplate> => {
  const queryParams = new URLSearchParams();
  queryParams.append("operationId", query.operationId);
  queryParams.append("patientType", query.patientType);
  queryParams.append("impressionType", query.impressionType);
  queryParams.append("materialId", query.materialId);

  const response = await client.get<LaborzettelTemplate>(
    `/laborzettel-templates/match?${queryParams.toString()}`,
  );
  return response.data;
};

// Update Laborzettel template
export const updateLaborzettelTemplate = async (
  id: string,
  data: UpdateLaborzettelTemplateDto,
): Promise<LaborzettelTemplate> => {
  const response = await client.patch<LaborzettelTemplate>(
    `/laborzettel-templates/${id}`,
    data,
  );
  return response.data;
};

// Delete Laborzettel template
export const deleteLaborzettelTemplate = async (
  id: string,
): Promise<LaborzettelTemplate> => {
  const response = await client.delete<LaborzettelTemplate>(
    `/laborzettel-templates/${id}`,
  );
  return response.data;
};

// Get template count
export const getLaborzettelTemplateCount = async (
  params: Omit<
    GetLaborzettelTemplatesParams,
    "page" | "limit" | "sortBy" | "sortOrder" | "search"
  > = {},
): Promise<number> => {
  const queryParams = new URLSearchParams();

  if (params.operation) queryParams.append("operation", params.operation);
  if (params.patientType) queryParams.append("patientType", params.patientType);
  if (params.impressionType)
    queryParams.append("impressionType", params.impressionType);
  if (params.material) queryParams.append("material", params.material);
  if (params.isActive !== undefined)
    queryParams.append("isActive", params.isActive.toString());

  const url = `/laborzettel-templates/count${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<number>(url);
  return response.data;
};
