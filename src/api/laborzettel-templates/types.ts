import { Pagination } from "../clinics/types";
import { Material } from "../materials/types";
import { Operation } from "../operations/types";
import { Procedure } from "../procedures/types";

// Patient type enum values
export type PatientType = "gkv" | "private" | "";

// Impression type enum values
export type ImpressionType = "scan" | "abdruck" | "";

/**
 * ProcedureItem - Represents a procedure reference with a default value
 * Used within ProcedureSection to define which procedures are included
 * and their default quantity values
 */
export interface ProcedureItem {
  procedure: string | Procedure;
  defaultValue: string; // '1', '2', 'teethCount', etc.
}

/**
 * ProcedureSection - Represents a grouping of procedures under a named section
 * Each section has a header, an array of procedure items, and a display order
 */
export interface ProcedureSection {
  sectionHeader: string;
  procedures: ProcedureItem[];
  displayOrder: number;
}

/**
 * LaborzettelTemplate - Defines a reusable template for generating Laborzettel documents
 * Templates are uniquely identified by the combination of operation, patientType,
 * impressionType, and material
 */
export interface LaborzettelTemplate {
  _id: string;
  name: string;
  operation: string | Operation;
  patientType: PatientType;
  impressionType: ImpressionType;
  material: string | Material;
  sections: ProcedureSection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTO types for creating procedure items
export interface ProcedureItemDto {
  procedure: string;
  defaultValue: string;
}

// DTO types for creating procedure sections
export interface ProcedureSectionDto {
  sectionHeader: string;
  procedures: ProcedureItemDto[];
  displayOrder?: number;
}

// DTO for creating a new Laborzettel template
export interface CreateLaborzettelTemplateDto {
  name: string;
  operation: string;
  patientType: PatientType;
  impressionType: ImpressionType;
  material: string;
  sections: ProcedureSectionDto[];
  isActive?: boolean;
}

// DTO for updating an existing Laborzettel template
export interface UpdateLaborzettelTemplateDto {
  name?: string;
  operation?: string;
  patientType?: PatientType;
  impressionType?: ImpressionType;
  material?: string;
  sections?: ProcedureSectionDto[];
  isActive?: boolean;
}

// Query parameters for template matching
export interface TemplateMatchQuery {
  operationId: string;
  patientType: PatientType;
  impressionType: ImpressionType;
  materialId: string;
}

// Response types
export interface GetLaborzettelTemplatesResponse {
  data: LaborzettelTemplate[];
  pagination: Pagination;
}

export type GetLaborzettelTemplateByIdResponse = LaborzettelTemplate;

// Import/Export types
export interface TemplateExportData {
  templates: LaborzettelTemplate[];
  exportedAt: string;
  version: string;
}

export interface TemplateImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}
