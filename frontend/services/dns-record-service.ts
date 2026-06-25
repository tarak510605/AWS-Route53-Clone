import apiClient from "@/lib/axios";
import type { DNSRecord, DNSRecordCreate, DNSRecordUpdate, PaginatedResponse } from "@/types";

interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  filter_type?: string;
  sort_by?: string;
  sort_order?: string;
}

export const dnsRecordService = {
  async list(zoneId: number, params: ListParams = {}): Promise<PaginatedResponse<DNSRecord>> {
    const { data } = await apiClient.get<PaginatedResponse<DNSRecord>>(
      `/api/hosted-zones/${zoneId}/records`,
      { params }
    );
    return data;
  },

  async get(recordId: number): Promise<DNSRecord> {
    const { data } = await apiClient.get<DNSRecord>(`/api/records/${recordId}`);
    return data;
  },

  async create(zoneId: number, payload: DNSRecordCreate): Promise<DNSRecord> {
    const { data } = await apiClient.post<DNSRecord>(
      `/api/hosted-zones/${zoneId}/records`,
      payload
    );
    return data;
  },

  async update(recordId: number, payload: DNSRecordUpdate): Promise<DNSRecord> {
    const { data } = await apiClient.put<DNSRecord>(
      `/api/records/${recordId}`,
      payload
    );
    return data;
  },

  async delete(recordId: number): Promise<void> {
    await apiClient.delete(`/api/records/${recordId}`);
  },

  async bulkDelete(zoneId: number, ids: number[]): Promise<{ deleted: number }> {
    const { data } = await apiClient.delete<{ deleted: number }>(
      `/api/hosted-zones/${zoneId}/records/bulk`,
      { data: { ids } }
    );
    return data;
  },
};
