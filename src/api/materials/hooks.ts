import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  Material,
  GetMaterialsResponse,
  GetMaterialByIdResponse,
} from "./types";
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  GetMaterialsParams,
} from "./requests";

// Create Material
export const useCreateMaterial = (): UseMutationResult<
  Material,
  AxiosError,
  CreateMaterialDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createMaterial(data),
  });
};

// Get all Materials with pagination, sorting, and filtering
export const useGetMaterials = (
  params: GetMaterialsParams = {}
): UseQueryResult<GetMaterialsResponse> => {
  return useQuery({
    queryKey: ["materials", params],
    queryFn: () => getMaterials(params),
  });
};

// Get Material by ID
export const useGetMaterialById = (
  materialId: string
): UseQueryResult<GetMaterialByIdResponse> => {
  return useQuery({
    queryKey: ["material", materialId],
    queryFn: () => getMaterialById(materialId),
    enabled: !!materialId,
  });
};

// Update Material
export const useUpdateMaterial = (): UseMutationResult<
  Material,
  AxiosError,
  { materialId: string; data: UpdateMaterialDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ materialId, data }) => updateMaterial(materialId, data),
  });
};

// Delete Material
export const useDeleteMaterial = (): UseMutationResult<
  Material,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (materialId) => deleteMaterial(materialId),
  });
};
