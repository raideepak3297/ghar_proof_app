import { apiClient } from "./client";

export interface TenantSearchResult {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  role: string;
}

export const usersApi = {
  async getTenants(search?: string): Promise<TenantSearchResult[]> {
    const res = await apiClient.get<TenantSearchResult[]>("/users/tenants", {
      params: search ? { search } : undefined,
    });
    return res.data;
  },
};
