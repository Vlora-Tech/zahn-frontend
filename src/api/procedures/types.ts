import { Pagination } from "../clinics/types";

export interface CreateProcedureDto {
  number: string;
  name: string;
  price: number;
}

export interface UpdateProcedureDto {
  number?: string;
  name?: string;
  price?: number;
}

export interface Procedure {
  _id: string;
  number: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetProceduresResponse {
  data: Procedure[];
  pagination: Pagination;
}

export type GetProcedureByIdResponse = Procedure;
