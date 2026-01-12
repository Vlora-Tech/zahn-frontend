import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateProcedureDto,
  UpdateProcedureDto,
  Procedure,
  GetProceduresResponse,
  GetProcedureByIdResponse,
} from "./types";
import {
  createProcedure,
  getProcedures,
  getProcedureById,
  updateProcedure,
  deleteProcedure,
  getProcedureCount,
  GetProceduresParams,
} from "./requests";

// Create Procedure
export const useCreateProcedure = (): UseMutationResult<
  Procedure,
  AxiosError,
  CreateProcedureDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createProcedure(data),
  });
};

// Get all Procedures with pagination and sorting
export const useGetProcedures = (
  params: GetProceduresParams = {},
): UseQueryResult<GetProceduresResponse> => {
  return useQuery({
    queryKey: ["procedures", params],
    queryFn: () => getProcedures(params),
  });
};

// Get Procedure by ID
export const useGetProcedureById = (
  procedureId: string,
): UseQueryResult<GetProcedureByIdResponse> => {
  return useQuery({
    queryKey: ["procedure", procedureId],
    queryFn: () => getProcedureById(procedureId),
    enabled: !!procedureId,
  });
};

// Update Procedure
export const useUpdateProcedure = (): UseMutationResult<
  Procedure,
  AxiosError,
  { procedureId: string; data: UpdateProcedureDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ procedureId, data }) => updateProcedure(procedureId, data),
  });
};

// Delete Procedure
export const useDeleteProcedure = (): UseMutationResult<
  Procedure,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (procedureId) => deleteProcedure(procedureId),
  });
};

// Get Procedure Count
export const useGetProcedureCount = (): UseQueryResult<number> => {
  return useQuery({
    queryKey: ["procedures", "count"],
    queryFn: () => getProcedureCount(),
  });
};
