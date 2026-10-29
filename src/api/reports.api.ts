import { apiClient } from './client';

export const reportsApi = {
  async downloadReportPdf(rentalId: string): Promise<Blob> {
    const res = await apiClient.get(`/rentals/${rentalId}/report.pdf`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
