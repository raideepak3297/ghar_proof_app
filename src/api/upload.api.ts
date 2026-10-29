import { apiClient } from './client';

export interface UploadResponse {
  _id: string;
  id?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  diskPath?: string;
  createdAt: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async uploadBatch(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await apiClient.post<UploadResponse[]>('/uploads/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
