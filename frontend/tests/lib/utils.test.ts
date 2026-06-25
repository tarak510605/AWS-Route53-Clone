import { describe, it, expect } from "vitest";
import { formatTTL, getApiError, cn } from "@/lib/utils";

describe("formatTTL", () => {
  it("formats 0 seconds", () => {
    expect(formatTTL(0)).toBe("0 seconds");
  });
  it("formats seconds", () => {
    expect(formatTTL(30)).toBe("30 seconds");
    expect(formatTTL(1)).toBe("1 second");
  });
  it("formats minutes", () => {
    expect(formatTTL(60)).toBe("1 minute");
    expect(formatTTL(300)).toBe("5 minutes");
  });
  it("formats hours", () => {
    expect(formatTTL(3600)).toBe("1 hour");
    expect(formatTTL(7200)).toBe("2 hours");
  });
  it("formats days", () => {
    expect(formatTTL(86400)).toBe("1 day");
    expect(formatTTL(172800)).toBe("2 days");
  });
});

describe("getApiError", () => {
  it("extracts error detail string", () => {
    const err = { response: { data: { detail: "Zone not found" } } };
    expect(getApiError(err)).toBe("Zone not found");
  });
  it("returns Error message", () => {
    expect(getApiError(new Error("Test error"))).toBe("Test error");
  });
  it("returns fallback for unknown error", () => {
    expect(getApiError(null)).toBe("An unexpected error occurred");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("px-4", "px-6")).toBe("px-6");
  });
});
