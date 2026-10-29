import { apiClient } from "./client";
import type { Dispute, DeductionCategory, SettlementSummary, PaginatedResponse } from "../types";

export const disputesApi = {
  async getByRentalId(rentalId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Dispute>> {
    const res = await apiClient.get<any>(`/rentals/${rentalId}/disputes`, { params });
    if (res.data && "list" in res.data) {
      return res.data;
    }
    return {
      list: Array.isArray(res.data) ? res.data : [],
      page: 1,
      limit: 20,
      total: Array.isArray(res.data) ? res.data.length : 0,
      size: Array.isArray(res.data) ? res.data.length : 0,
      hasMore: false,
    };
  },

  async getSettlement(rentalId: string): Promise<SettlementSummary> {
    const res = await apiClient.get<SettlementSummary>(`/rentals/${rentalId}/disputes/settlement`);
    return res.data;
  },

  async getById(rentalId: string, disputeId: string): Promise<Dispute> {
    const res = await apiClient.get<Dispute>(`/rentals/${rentalId}/disputes/${disputeId}`);
    return res.data;
  },

  async create(rentalId: string, data: {
    roomItemId?: string;
    category: DeductionCategory;
    proposedDeduction: number;
    description: string;
    evidencePhotos?: string[];
  }): Promise<Dispute> {
    const res = await apiClient.post<Dispute>(`/rentals/${rentalId}/disputes`, data);
    return res.data;
  },

  async updateStatus(rentalId: string, disputeId: string, data: {
    tenantStatus: "accepted" | "disputed";
    tenantComment?: string;
    counterAmount?: number;
  }): Promise<Dispute> {
    const res = await apiClient.patch<Dispute>(`/rentals/${rentalId}/disputes/${disputeId}`, data);
    return res.data;
  },
};
