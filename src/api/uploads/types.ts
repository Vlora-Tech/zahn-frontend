export interface UploadSingleResponse {
  url: string;
  key: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export type UploadMultipleResponse = UploadSingleResponse[];

export interface FileData {
  url: string;
  key: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  size: number;
} 