import { InventoryLot } from "../inventory/types";
import { LaborzettelTemplate } from "../laborzettel-templates/types";

export interface LeistungItem {
  procedureId?: string;
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

// Populated patient data
export interface PopulatedPatient {
  _id: string;
  firstName: string;
  lastName: string;
  patientNumber?: string;
  gender?: string;
  birthDate?: string;
}

// Populated doctor data
export interface PopulatedDoctor {
  _id: string;
  firstName: string;
  lastName: string;
}

// Populated clinic data
export interface PopulatedClinic {
  _id: string;
  name: string;
}

// Populated operation data
export interface PopulatedOperation {
  _id: string;
  name: string;
  color?: string;
}

// Populated request data
export interface PopulatedRequest {
  _id: string;
  requestNumber: string;
  deliveryDate?: string;
  patient?: PopulatedPatient;
  doctor?: PopulatedDoctor;
  clinic?: PopulatedClinic;
  operations?: {
    operation?: PopulatedOperation;
    selectedTeeth?: number[];
  }[];
}

// Populated lab technician data
export interface PopulatedLabTechnician {
  _id: string;
  firstName: string;
  lastName: string;
}

// Populated lab request data
export interface PopulatedLabRequest {
  _id: string;
  labStatus: string;
  request?: PopulatedRequest;
  assignedTechnician?: PopulatedLabTechnician;
  assignedTechnicianName?: string;
}

export interface Laborzettel {
  _id: string;
  labRequest: string | PopulatedLabRequest;
  laborzettelNumber: string;
  lotNr: string;
  sections: LeistungSection[];
  inventoryLots?: InventoryLot[];
  inventoryLotUsages?: InventoryLotUsage[];
  template?: string | LaborzettelTemplate;
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
  templateId?: string;
}

export interface UpdateLaborzettelDto {
  lotNr?: string;
  sections?: LeistungSection[];
  inventoryLotIds?: string[];
  inventoryLotUsages?: InventoryLotUsageDto[];
}
