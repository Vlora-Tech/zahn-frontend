import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  LaborzettelTemplate,
  CreateLaborzettelTemplateDto,
  UpdateLaborzettelTemplateDto,
  GetLaborzettelTemplatesResponse,
  GetLaborzettelTemplateByIdResponse,
  TemplateMatchQuery,
} from "./types";
import {
  createLaborzettelTemplate,
  getLaborzettelTemplates,
  getLaborzettelTemplateById,
  findMatchingTemplate,
  updateLaborzettelTemplate,
  deleteLaborzettelTemplate,
  getLaborzettelTemplateCount,
  GetLaborzettelTemplatesParams,
} from "./requests";

// Create Laborzettel Template
export const useCreateLaborzettelTemplate = (): UseMutationResult<
  LaborzettelTemplate,
  AxiosError,
  CreateLaborzettelTemplateDto,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createLaborzettelTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laborzettel-templates"] });
    },
  });
};

// Get all Laborzettel Templates with pagination and filtering
export const useGetLaborzettelTemplates = (
  params: GetLaborzettelTemplatesParams = {},
): UseQueryResult<GetLaborzettelTemplatesResponse> => {
  return useQuery({
    queryKey: ["laborzettel-templates", params],
    queryFn: () => getLaborzettelTemplates(params),
  });
};

// Get Laborzettel Template by ID
export const useGetLaborzettelTemplateById = (
  id: string,
): UseQueryResult<GetLaborzettelTemplateByIdResponse> => {
  return useQuery({
    queryKey: ["laborzettel-template", id],
    queryFn: () => getLaborzettelTemplateById(id),
    enabled: !!id,
  });
};

// Find matching template by operation, patient type, impression type, and material
export const useFindMatchingTemplate = (
  query: TemplateMatchQuery | null,
): UseQueryResult<LaborzettelTemplate> => {
  return useQuery({
    queryKey: ["laborzettel-template", "match", query],
    queryFn: () => findMatchingTemplate(query!),
    enabled:
      !!query?.operationId &&
      !!query?.patientType &&
      !!query?.impressionType &&
      !!query?.materialId,
    retry: false, // Don't retry on 404 (no matching template)
  });
};

// Update Laborzettel Template
export const useUpdateLaborzettelTemplate = (): UseMutationResult<
  LaborzettelTemplate,
  AxiosError,
  { id: string; data: UpdateLaborzettelTemplateDto },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateLaborzettelTemplate(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["laborzettel-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["laborzettel-template", result._id],
      });
    },
  });
};

// Delete Laborzettel Template
export const useDeleteLaborzettelTemplate = (): UseMutationResult<
  LaborzettelTemplate,
  AxiosError,
  string,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLaborzettelTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laborzettel-templates"] });
    },
  });
};

// Get Laborzettel Template Count
export const useGetLaborzettelTemplateCount = (
  params: Omit<
    GetLaborzettelTemplatesParams,
    "page" | "limit" | "sortBy" | "sortOrder" | "search"
  > = {},
): UseQueryResult<number> => {
  return useQuery({
    queryKey: ["laborzettel-templates", "count", params],
    queryFn: () => getLaborzettelTemplateCount(params),
  });
};
