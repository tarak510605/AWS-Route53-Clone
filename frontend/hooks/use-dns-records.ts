import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dnsRecordService } from "@/services/dns-record-service";
import { HOSTED_ZONES_KEY } from "@/hooks/use-hosted-zones";
import type { DNSRecordCreate, DNSRecordUpdate } from "@/types";

interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  filter_type?: string;
  sort_by?: string;
  sort_order?: string;
}

export const DNS_RECORDS_KEY = "dns-records";

export function useDNSRecords(zoneId: number, params: ListParams = {}) {
  return useQuery({
    queryKey: [DNS_RECORDS_KEY, zoneId, params],
    queryFn: () => dnsRecordService.list(zoneId, params),
    enabled: !!zoneId,
    staleTime: 30_000,
  });
}

export function useCreateDNSRecord(zoneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DNSRecordCreate) => dnsRecordService.create(zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DNS_RECORDS_KEY, zoneId] });
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY, zoneId] });
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}

export function useUpdateDNSRecord(zoneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DNSRecordUpdate }) =>
      dnsRecordService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DNS_RECORDS_KEY, zoneId] });
    },
  });
}

export function useDeleteDNSRecord(zoneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dnsRecordService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DNS_RECORDS_KEY, zoneId] });
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}

export function useBulkDeleteDNSRecords(zoneId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => dnsRecordService.bulkDelete(zoneId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DNS_RECORDS_KEY, zoneId] });
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}
