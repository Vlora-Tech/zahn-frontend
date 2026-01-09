import { Pagination } from "../clinics/types";

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  role?: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  clinic: string;
  notes?: string;
}

export interface UpdateDoctorDto {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other";
  role?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  clinic?: string;
  notes?: string;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  username: string;
  email?: string;
  phoneNumber?: string;
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

export interface GetDoctorsResponse {
  data: Doctor[];
  pagination: Pagination;
}

export type GetDoctorByIdResponse = Doctor;

export interface DoctorRequestBody {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  clinic: string;
  notes?: string;
}
