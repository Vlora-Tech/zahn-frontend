import client from "../../services/axiosClient";
import {
  InventoryMaterial,
  InventoryLot,
  InventoryMovement,
  CreateInventoryMaterialDto,
  UpdateInventoryMaterialDto,
  CreateInventoryLotDto,
  UpdateInventoryLotDto,
  UseMaterialDto,
  RestockLotDto,
  ReturnMaterialDto,
  LotTraceability,
  MaterialFilters,
  LotFilters,
} from "./types";

// ==================== MATERIALS ====================

export const createMaterial = async (
  data: CreateInventoryMaterialDto,
): Promise<InventoryMaterial> => {
  const response = await client.post<InventoryMaterial>(
    "/inventory/materials",
    data,
  );
  return response.data;
};

export const getMaterials = async (
  filters?: MaterialFilters,
): Promise<InventoryMaterial[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.isActive !== undefined)
    params.append("isActive", String(filters.isActive));
  if (filters?.search) params.append("search", filters.search);

  const response = await client.get<InventoryMaterial[]>(
    `/inventory/materials?${params.toString()}`,
  );
  return response.data;
};

export const getMaterialById = async (
  id: string,
): Promise<InventoryMaterial> => {
  const response = await client.get<InventoryMaterial>(
    `/inventory/materials/${id}`,
  );
  return response.data;
};

export const getMaterialCategories = async (): Promise<string[]> => {
  const response = await client.get<string[]>(
    "/inventory/materials/categories",
  );
  return response.data;
};

export const updateMaterial = async (
  id: string,
  data: UpdateInventoryMaterialDto,
): Promise<InventoryMaterial> => {
  const response = await client.patch<InventoryMaterial>(
    `/inventory/materials/${id}`,
    data,
  );
  return response.data;
};

export const deleteMaterial = async (id: string): Promise<void> => {
  await client.delete(`/inventory/materials/${id}`);
};

// ==================== LOTS ====================

export const createLot = async (
  data: CreateInventoryLotDto,
): Promise<InventoryLot> => {
  const response = await client.post<InventoryLot>("/inventory/lots", data);
  return response.data;
};

export const getLots = async (
  filters?: LotFilters,
): Promise<InventoryLot[]> => {
  const params = new URLSearchParams();
  if (filters?.materialId) params.append("materialId", filters.materialId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.inStockOnly) params.append("inStockOnly", "true");

  const response = await client.get<InventoryLot[]>(
    `/inventory/lots?${params.toString()}`,
  );
  return response.data;
};

export const getLotById = async (id: string): Promise<InventoryLot> => {
  const response = await client.get<InventoryLot>(`/inventory/lots/${id}`);
  return response.data;
};

export const getLotsByMaterial = async (
  materialId: string,
): Promise<InventoryLot[]> => {
  const response = await client.get<InventoryLot[]>(
    `/inventory/lots/material/${materialId}`,
  );
  return response.data;
};

export const getInStockLotsByMaterial = async (
  materialId: string,
): Promise<InventoryLot[]> => {
  const response = await client.get<InventoryLot[]>(
    `/inventory/lots/in-stock/${materialId}`,
  );
  return response.data;
};

export const getLowStockLots = async (): Promise<InventoryLot[]> => {
  const response = await client.get<InventoryLot[]>(
    "/inventory/lots/low-stock",
  );
  return response.data;
};

export const getExpiringLots = async (
  daysAhead?: number,
): Promise<InventoryLot[]> => {
  const params = daysAhead ? `?daysAhead=${daysAhead}` : "";
  const response = await client.get<InventoryLot[]>(
    `/inventory/lots/expiring${params}`,
  );
  return response.data;
};

export const updateLot = async (
  id: string,
  data: UpdateInventoryLotDto,
): Promise<InventoryLot> => {
  const response = await client.patch<InventoryLot>(
    `/inventory/lots/${id}`,
    data,
  );
  return response.data;
};

// ==================== MOVEMENTS ====================

export const useMaterial = async (
  data: UseMaterialDto,
): Promise<InventoryMovement> => {
  const response = await client.post<InventoryMovement>(
    "/inventory/movements/use",
    data,
  );
  return response.data;
};

export const restockLot = async (
  data: RestockLotDto,
): Promise<InventoryMovement> => {
  const response = await client.post<InventoryMovement>(
    "/inventory/movements/restock",
    data,
  );
  return response.data;
};

export const returnMaterial = async (
  data: ReturnMaterialDto,
): Promise<InventoryMovement> => {
  const response = await client.post<InventoryMovement>(
    "/inventory/movements/return",
    data,
  );
  return response.data;
};

export const getMovementsByLot = async (
  lotId: string,
): Promise<InventoryMovement[]> => {
  const response = await client.get<InventoryMovement[]>(
    `/inventory/movements/lot/${lotId}`,
  );
  return response.data;
};

export const getMovementsByLabRequest = async (
  labRequestId: string,
): Promise<InventoryMovement[]> => {
  const response = await client.get<InventoryMovement[]>(
    `/inventory/movements/lab-request/${labRequestId}`,
  );
  return response.data;
};

export const getMovementsByLaborzettel = async (
  laborzettelId: string,
): Promise<InventoryMovement[]> => {
  const response = await client.get<InventoryMovement[]>(
    `/inventory/movements/laborzettel/${laborzettelId}`,
  );
  return response.data;
};

// ==================== TRACEABILITY ====================

export const getTraceabilityByLot = async (
  lotId: string,
): Promise<LotTraceability> => {
  const response = await client.get<LotTraceability>(
    `/inventory/traceability/lot/${lotId}`,
  );
  return response.data;
};
