
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateClinicDto {
  name: string;
  street: string;
  buildingNo: string;
  postalCode: string;
  city: string;
  phoneNumber: string;
  notes?: string;
}

export interface UpdateClinicDto {
  name?: string;
  street?: string;
  buildingNo?: string;
  postalCode?: string;
  city?: string;
  phoneNumber?: string;
  notes?: string;
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

export interface GetClinicsResponse {
  data: Clinic[];
  pagination: Pagination;
}

export type GetClinicByIdResponse = Clinic;

export interface ClinicRequestBody {
  name: string;
  city: string;
  address: string;
  number: string;
} 