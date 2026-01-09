import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  getMaterialCategories,
  updateMaterial,
  deleteMaterial,
  createLot,
  getLots,
  getLotById,
  getLotsByMaterial,
  getInStockLotsByMaterial,
  getLowStockLots,
  getExpiringLots,
  updateLot,
  useMaterial as useMaterialRequest,
  restockLot,
  returnMaterial,
  getMovementsByLot,
  getMovementsByLabRequest,
  getMovementsByLaborzettel,
  getTraceabilityByLot,
} from "./requests";
import {
  CreateInventoryMaterialDto,
  UpdateInventoryMaterialDto,
  CreateInventoryLotDto,
  UpdateInventoryLotDto,
  UseMaterialDto,
  RestockLotDto,
  ReturnMaterialDto,
  MaterialFilters,
  LotFilters,
} from "./types";

// ==================== MATERIALS ====================

export const useMaterials = (filters?: MaterialFilters) => {
  return useQuery({
    queryKey: ["inventory", "materials", filters],
    queryFn: () => getMaterials(filters),
  });
};

export const useInventoryMaterial = (id: string) => {
  return useQuery({
    queryKey: ["inventory", "materials", id],
    queryFn: () => getMaterialById(id),
    enabled: !!id,
  });
};

export const useMaterialCategories = () => {
  return useQuery({
    queryKey: ["inventory", "materials", "categories"],
    queryFn: getMaterialCategories,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryMaterialDto) => createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "materials"] });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInventoryMaterialDto;
    }) => updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "materials"] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "materials"] });
    },
  });
};

// ==================== LOTS ====================

export const useLots = (filters?: LotFilters) => {
  return useQuery({
    queryKey: ["inventory", "lots", filters],
    queryFn: () => getLots(filters),
  });
};

export const useLot = (id: string) => {
  return useQuery({
    queryKey: ["inventory", "lots", id],
    queryFn: () => getLotById(id),
    enabled: !!id,
  });
};

export const useLotsByMaterial = (materialId: string) => {
  return useQuery({
    queryKey: ["inventory", "lots", "material", materialId],
    queryFn: () => getLotsByMaterial(materialId),
    enabled: !!materialId,
  });
};

export const useInStockLotsByMaterial = (materialId: string) => {
  return useQuery({
    queryKey: ["inventory", "lots", "in-stock", materialId],
    queryFn: () => getInStockLotsByMaterial(materialId),
    enabled: !!materialId,
  });
};

export const useLowStockLots = () => {
  return useQuery({
    queryKey: ["inventory", "lots", "low-stock"],
    queryFn: getLowStockLots,
  });
};

export const useExpiringLots = (daysAhead?: number) => {
  return useQuery({
    queryKey: ["inventory", "lots", "expiring", daysAhead],
    queryFn: () => getExpiringLots(daysAhead),
  });
};

export const useCreateLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInventoryLotDto) => createLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "lots"] });
    },
  });
};

export const useUpdateLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryLotDto }) =>
      updateLot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "lots"] });
    },
  });
};

// ==================== MOVEMENTS ====================

export const useUseMaterialFromStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UseMaterialDto) => useMaterialRequest(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "lots"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "movements", "lot", variables.lotId],
      });
      if (variables.labRequestId) {
        queryClient.invalidateQueries({
          queryKey: [
            "inventory",
            "movements",
            "lab-request",
            variables.labRequestId,
          ],
        });
      }
      if (variables.laborzettelId) {
        queryClient.invalidateQueries({
          queryKey: [
            "inventory",
            "movements",
            "laborzettel",
            variables.laborzettelId,
          ],
        });
      }
    },
  });
};

export const useRestockLot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RestockLotDto) => restockLot(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "lots"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "movements", "lot", variables.lotId],
      });
    },
  });
};

export const useReturnMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReturnMaterialDto) => returnMaterial(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "lots"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "movements", "lot", variables.lotId],
      });
    },
  });
};

export const useMovementsByLot = (lotId: string) => {
  return useQuery({
    queryKey: ["inventory", "movements", "lot", lotId],
    queryFn: () => getMovementsByLot(lotId),
    enabled: !!lotId,
  });
};

export const useMovementsByLabRequest = (labRequestId: string) => {
  return useQuery({
    queryKey: ["inventory", "movements", "lab-request", labRequestId],
    queryFn: () => getMovementsByLabRequest(labRequestId),
    enabled: !!labRequestId,
  });
};

export const useMovementsByLaborzettel = (laborzettelId: string) => {
  return useQuery({
    queryKey: ["inventory", "movements", "laborzettel", laborzettelId],
    queryFn: () => getMovementsByLaborzettel(laborzettelId),
    enabled: !!laborzettelId,
  });
};

// ==================== TRACEABILITY ====================

export const useTraceabilityByLot = (lotId: string) => {
  return useQuery({
    queryKey: ["inventory", "traceability", "lot", lotId],
    queryFn: () => getTraceabilityByLot(lotId),
    enabled: !!lotId,
  });
};
