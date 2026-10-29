import { apiClient } from "./client";
import type { AuthResponse, RegisterData, RegisterResponse, User } from "../types";

export const authApi = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>("/auth/register", data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },
};
