export interface User {
  id: number;
  email: string;
}

export interface HostedZone {
  id: number;
  zone_name: string;
  comment: string;
  private_zone: boolean;
  record_count: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreate {
  zone_name: string;
  comment?: string;
  private_zone?: boolean;
}

export interface HostedZoneUpdate {
  comment?: string;
  private_zone?: boolean;
}

export interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: string;
  value: string;
  ttl: number;
  routing_policy: string;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreate {
  name: string;
  type: string;
  value: string;
  ttl: number;
  routing_policy: string;
}

export interface DNSRecordUpdate {
  name?: string;
  type?: string;
  value?: string;
  ttl?: number;
  routing_policy?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type DNSRecordType = "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "PTR" | "SRV" | "CAA";
export type RoutingPolicy = "Simple" | "Weighted" | "Latency" | "Failover" | "Geolocation" | "Multivalue";

export const DNS_RECORD_TYPES: DNSRecordType[] = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];
export const ROUTING_POLICIES: RoutingPolicy[] = ["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"];
export const PAGE_SIZES = [10, 25, 50];
