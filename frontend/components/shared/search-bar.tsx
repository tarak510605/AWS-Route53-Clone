"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-aws-gray-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-aws-gray-300 rounded bg-white focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue placeholder:text-aws-gray-400"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-aws-gray-400 hover:text-aws-gray-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
