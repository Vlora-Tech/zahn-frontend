import { Pagination } from "../clinics/types";

export interface PatientRequestBody {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  patientType: "private" | "gkv";
  dueDate: string;
  doctor: string;
  notes?: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  patientType: "private" | "gkv";
  notes?: string;
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;
  patientType?: "private" | "gkv";
  notes?: string;
}

export interface PatientResponse {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  patientNumber: string;
  patientType: string;
  dueDate: string;
  doctor: Doctor;
  clinic: Clinic;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetPatientsResponse {
  data: Patient[];
  pagination: Pagination;
}

export interface GetPatientByIdResponse {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  patientType: string;
  patientNumber: string;
  dueDate: string;
  doctor: Doctor;
  clinic: Clinic;
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

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  patientType: string;
  patientNumber: string;
  dueDate: string;
  doctor: Doctor;
  clinic: Clinic;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PatientStats {
  totalPatients: number;
  privatePatients: number;
  gkvPatients: number;
}
