import { InventoryLot } from "../inventory/types";

export interface LeistungItem {
  number: string;
  name: string;
  menge: string;
}

export interface LeistungSection {
  section: string;
  items: LeistungItem[];
}

export interface InventoryLotUsage {
  lot: InventoryLot;
  quantityUsed: number;
}

export interface Laborzettel {
  _id: string;
  labRequest: string;
  laborzettelNumber: string;
  lotNr: string;
  sections: LeistungSection[];
  inventoryLots?: InventoryLot[];
  inventoryLotUsages?: InventoryLotUsage[];
  createdBy: string;
  createdByModel: string;
  updatedBy?: string;
  updatedByModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLotUsageDto {
  lotId: string;
  quantityUsed: number;
}

export interface CreateLaborzettelDto {
  labRequestId: string;
  lotNr: string;
  sections: LeistungSection[];
  inventoryLotIds?: string[];
  inventoryLotUsages?: InventoryLotUsageDto[];
}

export interface UpdateLaborzettelDto {
  lotNr?: string;
  sections?: LeistungSection[];
  inventoryLotIds?: string[];
  inventoryLotUsages?: InventoryLotUsageDto[];
}
