import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationState {
  page: number;
  pageSize: number;
}

export function usePagination(defaults: PaginationState = { page: 1, pageSize: 25 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || defaults.page);
  const pageSize = Number(searchParams.get("pageSize") || defaults.pageSize);

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", String(newSize));
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return { page, pageSize, setPage, setPageSize };
}

export function useSearch(defaultValue = "") {
  const [search, setSearch] = useState(defaultValue);
  const [debouncedSearch, setDebouncedSearch] = useState(defaultValue);

  const handleChange = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timer);
  }, []);

  return { search, debouncedSearch, setSearch: handleChange };
}
