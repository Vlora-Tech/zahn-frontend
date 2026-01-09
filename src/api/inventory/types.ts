// Material types
export interface InventoryMaterial {
  _id: string;
  name: string;
  category: string;
  unit: string;
  manufacturer?: string;
  internalCode: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdByModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryMaterialDto {
  name: string;
  category: string;
  unit: string;
  manufacturer?: string;
  internalCode: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateInventoryMaterialDto {
  name?: string;
  category?: string;
  unit?: string;
  manufacturer?: string;
  internalCode?: string;
  description?: string;
  isActive?: boolean;
}

// Lot types
export type LotStatus = "in_stock" | "low_stock" | "depleted" | "expired";

export interface InventoryLot {
  _id: string;
  material: InventoryMaterial | string;
  lotNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  deliveryDate: string;
  expiryDate?: string;
  supplier?: string;
  supplierLotNumber?: string;
  notes?: string;
  isManualEntry: boolean;
  status: LotStatus;
  createdBy: string;
  createdByModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryLotDto {
  materialId: string;
  lotNumber: string;
  initialQuantity: number;
  unit: string;
  deliveryDate: string;
  expiryDate?: string;
  supplier?: string;
  supplierLotNumber?: string;
  notes?: string;
  isManualEntry?: boolean;
}

export interface UpdateInventoryLotDto {
  lotNumber?: string;
  expiryDate?: string;
  supplier?: string;
  supplierLotNumber?: string;
  notes?: string;
}

// Movement types
export type MovementType = "in" | "out" | "adjustment";
export type MovementReason =
  | "initial_stock"
  | "restock"
  | "usage"
  | "return"
  | "adjustment"
  | "expired"
  | "damaged";

export interface InventoryMovement {
  _id: string;
  lot: InventoryLot | string;
  movementType: MovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: MovementReason;
  notes?: string;
  labRequest?: string;
  laborzettel?: string;
  leistungNumber?: string;
  performedBy: string;
  performedByModel: string;
  performedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseMaterialDto {
  lotId: string;
  quantity: number;
  labRequestId?: string;
  laborzettelId?: string;
  leistungNumber?: string;
  notes?: string;
}

export interface RestockLotDto {
  lotId: string;
  quantity: number;
  notes?: string;
}

export interface ReturnMaterialDto {
  lotId: string;
  quantity: number;
  notes?: string;
}

// Traceability
export interface LotTraceability {
  lot: InventoryLot;
  movements: InventoryMovement[];
  usedInRequests: string[];
}

// Filter types
export interface MaterialFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
}

export interface LotFilters {
  materialId?: string;
  status?: LotStatus;
  inStockOnly?: boolean;
}
