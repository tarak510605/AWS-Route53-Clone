import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hostedZoneService } from "@/services/hosted-zone-service";
import type { HostedZoneCreate, HostedZoneUpdate } from "@/types";

interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  filter_type?: string;
  sort_by?: string;
  sort_order?: string;
}

export const HOSTED_ZONES_KEY = "hosted-zones";

export function useHostedZones(params: ListParams = {}) {
  return useQuery({
    queryKey: [HOSTED_ZONES_KEY, params],
    queryFn: () => hostedZoneService.list(params),
    staleTime: 30_000,
  });
}

export function useHostedZone(id: number) {
  return useQuery({
    queryKey: [HOSTED_ZONES_KEY, id],
    queryFn: () => hostedZoneService.get(id),
    enabled: !!id,
  });
}

export function useCreateHostedZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HostedZoneCreate) => hostedZoneService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}

export function useUpdateHostedZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HostedZoneUpdate }) =>
      hostedZoneService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}

export function useDeleteHostedZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hostedZoneService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSTED_ZONES_KEY] });
    },
  });
}
