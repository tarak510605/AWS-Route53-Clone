"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGE_SIZES } from "@/types";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-aws-gray-200 bg-aws-gray-50 text-xs text-aws-gray-600">
      <div className="flex items-center gap-3">
        <span>
          {total === 0 ? "0 results" : `${start}–${end} of ${total}`}
        </span>
        <div className="flex items-center gap-1.5">
          <label htmlFor="page-size" className="text-aws-gray-500">
            Per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-aws-gray-300 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-aws-blue"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-aws-gray-500 mr-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={cn(
            "p-1 rounded border border-aws-gray-300 bg-white",
            page === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-aws-gray-100"
          )}
          aria-label="First page"
        >
          <ChevronLeft size={12} className="inline" />
          <ChevronLeft size={12} className="inline -ml-1.5" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            "p-1 rounded border border-aws-gray-300 bg-white",
            page === 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-aws-gray-100"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "min-w-[28px] h-7 px-1 text-xs rounded border",
                pageNum === page
                  ? "bg-aws-blue text-white border-aws-blue"
                  : "border-aws-gray-300 bg-white hover:bg-aws-gray-100"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "p-1 rounded border border-aws-gray-300 bg-white",
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-aws-gray-100"
          )}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={cn(
            "p-1 rounded border border-aws-gray-300 bg-white",
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-aws-gray-100"
          )}
          aria-label="Last page"
        >
          <ChevronRight size={12} className="inline" />
          <ChevronRight size={12} className="inline -ml-1.5" />
        </button>
      </div>
    </div>
  );
}
