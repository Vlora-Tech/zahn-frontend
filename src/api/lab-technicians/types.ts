import { Pagination } from "../clinics/types";

export interface CreateLabTechnicianDto {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  username: string;
  password: string;
  clinic: string;
  notes?: string;
}

export interface UpdateLabTechnicianDto {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other";
  username?: string;
  clinic?: string;
  notes?: string;
}

export interface LabTechnician {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  username: string;
  clinic: {
    _id: string;
    name: string;
    city: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetLabTechniciansResponse {
  data: LabTechnician[];
  pagination: Pagination;
}

export type GetLabTechnicianByIdResponse = LabTechnician;
