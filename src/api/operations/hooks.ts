import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
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
import {
  createOperation,
  getOperations,
  getOperationCategories,
  getOperationById,
  updateOperation,
  deleteOperation,
  getMaterialsForOperation,
  getOptionsForOperation,
  addMaterialToOperation,
  removeMaterialFromOperation,
  addOptionToOperation,
  removeOptionFromOperation,
  GetOperationsParams,
} from "./requests";

// Create Operation
export const useCreateOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  CreateOperationDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createOperation(data),
  });
};

// Get all Operations with pagination, sorting, and filtering
export const useGetOperations = (
  params: GetOperationsParams = {}
): UseQueryResult<GetOperationsResponse> => {
  return useQuery({
    queryKey: ["operations", params],
    queryFn: () => getOperations(params),
  });
};

// Get Operation Categories
export const useGetOperationCategories = (): UseQueryResult<GetOperationCategoriesResponse> => {
  return useQuery({
    queryKey: ["operation-categories"],
    queryFn: getOperationCategories,
  });
};

// Get Operation by ID
export const useGetOperationById = (
  operationId: string
): UseQueryResult<GetOperationByIdResponse> => {
  return useQuery({
    queryKey: ["operation", operationId],
    queryFn: () => getOperationById(operationId),
    enabled: !!operationId,
  });
};

// Update Operation
export const useUpdateOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  { operationId: string; data: UpdateOperationDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ operationId, data }) => updateOperation(operationId, data),
  });
};

// Delete Operation
export const useDeleteOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (operationId) => deleteOperation(operationId),
  });
};

// Get Materials for Operation
export const useGetMaterialsForOperation = (
  operationId: string
): UseQueryResult<Material[]> => {
  return useQuery({
    queryKey: ["operation-materials", operationId],
    queryFn: () => getMaterialsForOperation(operationId),
    enabled: !!operationId,
  });
};

// Get Options for Operation
export const useGetOptionsForOperation = (
  operationId: string
): UseQueryResult<Option[]> => {
  return useQuery({
    queryKey: ["operation-options", operationId],
    queryFn: () => getOptionsForOperation(operationId),
    enabled: !!operationId,
  });
};

// Add Material to Operation
export const useAddMaterialToOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  { operationId: string; materialId: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ operationId, materialId }) => addMaterialToOperation(operationId, materialId),
  });
};

// Remove Material from Operation
export const useRemoveMaterialFromOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  { operationId: string; materialId: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ operationId, materialId }) => removeMaterialFromOperation(operationId, materialId),
  });
};

// Add Option to Operation
export const useAddOptionToOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  { operationId: string; optionId: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ operationId, optionId }) => addOptionToOperation(operationId, optionId),
  });
};

// Remove Option from Operation
export const useRemoveOptionFromOperation = (): UseMutationResult<
  Operation,
  AxiosError,
  { operationId: string; optionId: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ operationId, optionId }) => removeOptionFromOperation(operationId, optionId),
  });
};