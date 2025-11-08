import { Pagination } from "../clinics/types";

export interface SelectedOptionDto {
  option: string;
  value: unknown;
}

export interface ToothConfigurationDto {
  toothId: number;
  operation: string;
  material: string;
  selectedOptions: SelectedOptionDto[];
}

export interface FileDataDto {
  url: string;
  key: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface SelectedConnectorDto {
  connector: [number, number];
  operation: string;
  material: string;
  selectedOptions: SelectedOptionDto[];
}

export interface CreateRequestDto {
  clinic: string;
  deliveryDate: string;
  doctor: string;
  isDoctorApprovalNeeded: boolean;
  notes: string;
  operations: Operation[];
  patient: string;
  impression: string;
  shade: string;
}

export type UpdateRequestDto = Partial<CreateRequestDto>;

export interface ApproveRequestDto {
  notes?: string;
}

export interface RejectRequestDto {
  reason: string;
}

export interface TreatmentRequest {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  clinic: Clinic;
  requestedBy: any;
  operations: TreatmentRequestOperation[];
  status: string;
  notes: string;
  data: any[];
  insurance: string;
  deliveryDate: string;
  isDoctorApprovalNeeded: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  requestNumber: string;
  shade: string;
  impression: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  patientType: string;
  patientNumber: string;
  dueDate: string;
  doctor: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  clinic: string;
  role: string;
  gender: string;
  username: string;
  password: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Clinic {
  _id: string;
  name: string;
  street: string;
  buildingNo: string;
  postalCode: string;
  city: string;
  phoneNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TreatmentRequestOperation {
  operationIdx: string;
  selectedTeeth: number[];
  connectors: Array<[number, number]>;
  impression: string;
  shade: string;
  operation: Operation2;
  material: Material;
  optionsAndParameters: OptionsAndParameters;
}

export interface Operation2 {
  _id: string;
  name: string;
  category: Category;
  materials: string[];
  options: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  description: string;
  color: string;
}

export interface Category {
  order: number;
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Material {
  order: number;
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OptionsAndParameters {
  Brückenglied?: string;
  Zahnform?: string;
  Transluzentart?: string;
}

export interface GetTreatmentRequestsResponse {
  data: TreatmentRequest[];
  pagination: Pagination;
}

export type GetTreatmentRequestByIdResponse = TreatmentRequest;

export interface TreatmentRequestStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  autoApprovedRequests: number;
}

export interface TreatmentRequestRequestBody {
  clinic: string;
  deliveryDate: string;
  doctor: string;
  insurance: string;
  isDoctorApprovalNeeded: boolean;
  notes: string;
  operations: Operation[];
  patient: string;
  impression: string;
  shade: string;
}

export interface Operation {
  operationIdx: string;
  selectedTeeth: number[];
  connectors: Array<[number, number]>;
  operation: string;
  material: string;
  optionsAndParameters: OptionsAndParameters;
}

export interface OptionsAndParameters {
  [key: string]: string;
}
