import { apiClient } from "./client";
import type { PaginatedResponse, Rental } from "../types";

let inFlightGetAll: Promise<PaginatedResponse<Rental>> | null = null;

export const rentalsApi = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Rental>> {
    if (!params && inFlightGetAll) {
      return inFlightGetAll;
    }

    const fetchPromise = (async () => {
      try {
        const res = await apiClient.get<any>("/rentals", { params });
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
      } finally {
        if (!params) {
          inFlightGetAll = null;
        }
      }
    })();

    if (!params) {
      inFlightGetAll = fetchPromise;
    }

    return fetchPromise;
  },

  async getById(id: string): Promise<Rental> {
    const res = await apiClient.get<Rental>(`/rentals/${id}`);
    return res.data;
  },

  async create(data: {
    propertyAddress: { line1: string; line2?: string; city: string; state: string; postalCode: string };
    monthlyRent: number;
    depositAmount: number;
    startDate: string;
    endDate?: string;
    tenantId?: string;
    tenantInviteEmail?: string;
    tenantInvitePhone?: string;
  }): Promise<Rental> {
    const res = await apiClient.post<Rental>("/rentals", data);
    return res.data;
  },

  async acceptInvite(rentalId: string): Promise<{ message: string; rentalId: string }> {
    const res = await apiClient.post<{ message: string; rentalId: string }>(`/rentals/${rentalId}/accept-invite`);
    return res.data;
  },
};
