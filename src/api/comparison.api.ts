import { apiClient } from './client';
import type { ComparisonResult } from '../types';

export const comparisonApi = {
  async getByRentalId(rentalId: string): Promise<ComparisonResult> {
    const res = await apiClient.get<ComparisonResult>(`/rentals/${rentalId}/comparison`);
    return res.data;
  },
};
