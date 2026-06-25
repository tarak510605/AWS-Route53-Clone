import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function formatTTL(seconds: number): string {
  if (seconds === 0) return "0 seconds";
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m !== 1 ? "s" : ""}`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h !== 1 ? "s" : ""}`;
  }
  const d = Math.floor(seconds / 86400);
  return `${d} day${d !== 1 ? "s" : ""}`;
}

export function getApiError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const resp = (error as { response?: { data?: { detail?: unknown } } }).response;
    if (resp?.data?.detail !== undefined && resp.data.detail !== null) {
      const detail = resp.data.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "msg" in item &&
              typeof (item as Record<string, unknown>).msg === "string"
            ) {
              return (item as Record<string, unknown>).msg as string;
            }
            return String(item);
          })
          .join(", ");
      }
    }
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
