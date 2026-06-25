"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-aws-gray-600">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={13} className="text-aws-gray-400" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-aws-blue hover:text-aws-blue-dark hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-aws-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
