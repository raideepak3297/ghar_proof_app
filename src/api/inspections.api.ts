import { apiClient } from "./client";
import type { Inspection, RoomItem, ItemCondition } from "../types";

export const inspectionsApi = {
  async getById(id: string): Promise<Inspection> {
    const res = await apiClient.get<Inspection>(`/inspections/${id}`);
    return res.data;
  },

  async getByRental(rentalId: string): Promise<Inspection[]> {
    const res = await apiClient.get<Inspection[]>(`/rentals/${rentalId}/inspections`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async create(rentalId: string, type: "move_in" | "move_out", notes?: string): Promise<Inspection> {
    const res = await apiClient.post<Inspection>(`/rentals/${rentalId}/inspections`, { type, notes });
    return res.data;
  },

  async update(id: string, notes: string): Promise<Inspection> {
    const res = await apiClient.patch<Inspection>(`/inspections/${id}`, { notes });
    return res.data;
  },

  async addRoomItem(inspectionId: string, data: {
    roomName: string;
    itemName: string;
    condition: ItemCondition;
    notes?: string;
    photos?: string[];
  }): Promise<RoomItem> {
    const res = await apiClient.post<RoomItem>(`/inspections/${inspectionId}/items`, data);
    return res.data;
  },

  async updateRoomItem(inspectionId: string, itemId: string, data: {
    condition?: ItemCondition;
    notes?: string;
    photos?: string[];
  }): Promise<RoomItem> {
    const res = await apiClient.patch<RoomItem>(`/inspections/${inspectionId}/items/${itemId}`, data);
    return res.data;
  },

  async signOff(inspectionId: string, agree: boolean): Promise<Inspection> {
    const res = await apiClient.post<Inspection>(`/inspections/${inspectionId}/sign-off`, { agree });
    return res.data;
  },
};
