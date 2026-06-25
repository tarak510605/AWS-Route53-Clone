import apiClient from "@/lib/axios";
import type { HostedZone, HostedZoneCreate, HostedZoneUpdate, PaginatedResponse } from "@/types";

interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  filter_type?: string;
  sort_by?: string;
  sort_order?: string;
}

export const hostedZoneService = {
  async list(params: ListParams = {}): Promise<PaginatedResponse<HostedZone>> {
    const { data } = await apiClient.get<PaginatedResponse<HostedZone>>(
      "/api/hosted-zones",
      { params }
    );
    return data;
  },

  async get(id: number): Promise<HostedZone> {
    const { data } = await apiClient.get<HostedZone>(`/api/hosted-zones/${id}`);
    return data;
  },

  async create(payload: HostedZoneCreate): Promise<HostedZone> {
    const { data } = await apiClient.post<HostedZone>("/api/hosted-zones", payload);
    return data;
  },

  async update(id: number, payload: HostedZoneUpdate): Promise<HostedZone> {
    const { data } = await apiClient.put<HostedZone>(
      `/api/hosted-zones/${id}`,
      payload
    );
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/hosted-zones/${id}`);
  },
};
