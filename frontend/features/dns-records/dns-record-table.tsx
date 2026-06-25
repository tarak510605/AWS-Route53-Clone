"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { cn, formatTTL } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { DNSRecord } from "@/types";

interface DNSRecordTableProps {
  records: DNSRecord[];
  loading?: boolean;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  onEdit: (record: DNSRecord) => void;
  onDelete: (record: DNSRecord) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: string) => void;
}

const RECORD_TYPE_COLORS: Record<string, string> = {
  A: "bg-blue-50 text-blue-700 border-blue-200",
  AAAA: "bg-purple-50 text-purple-700 border-purple-200",
  CNAME: "bg-green-50 text-green-700 border-green-200",
  TXT: "bg-yellow-50 text-yellow-700 border-yellow-200",
  MX: "bg-orange-50 text-orange-700 border-orange-200",
  NS: "bg-red-50 text-red-700 border-red-200",
  PTR: "bg-pink-50 text-pink-700 border-pink-200",
  SRV: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CAA: "bg-teal-50 text-teal-700 border-teal-200",
};

const columnHelper = createColumnHelper<DNSRecord>();

export function DNSRecordTable({
  records,
  loading,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: DNSRecordTableProps) {
  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));
  const someSelected = records.some((r) => selectedIds.has(r.id));

  const toggleAll = () => {
    if (allSelected) onSelectionChange(new Set());
    else onSelectionChange(new Set(records.map((r) => r.id)));
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const columns = [
    columnHelper.display({
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
          onChange={toggleAll}
          className="w-4 h-4 rounded border-aws-gray-400 text-aws-blue cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleOne(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-aws-gray-400 text-aws-blue cursor-pointer"
        />
      ),
      size: 40,
    }),
    columnHelper.accessor("name", {
      header: "Record name",
      cell: (info) => (
        <span className="font-mono text-sm text-aws-gray-800">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => {
        const type = info.getValue();
        return (
          <span
            className={cn(
              "badge-record-type",
              RECORD_TYPE_COLORS[type] || "bg-aws-gray-100 text-aws-gray-700"
            )}
          >
            {type}
          </span>
        );
      },
    }),
    columnHelper.accessor("ttl", {
      header: "TTL (seconds)",
      cell: (info) => (
        <span className="font-mono text-aws-gray-700" title={formatTTL(info.getValue())}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("value", {
      header: "Value/Route traffic to",
      cell: (info) => (
        <span className="font-mono text-xs text-aws-gray-700 max-w-[300px] block truncate" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("routing_policy", {
      header: "Routing policy",
      cell: (info) => (
        <span className="text-aws-gray-600 text-xs">{info.getValue()}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(row.original)}
            title="Edit record"
            className="p-1.5 text-aws-gray-500 hover:text-aws-blue hover:bg-aws-blue-light rounded"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(row.original)}
            title="Delete record"
            className="p-1.5 text-aws-gray-500 hover:text-aws-red hover:bg-aws-red-light rounded"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const SORTABLE = { name: "name", type: "type", ttl: "ttl", routing_policy: "routing_policy" };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortOrder === "asc" ? <ArrowUp size={12} className="text-aws-blue" /> : <ArrowDown size={12} className="text-aws-blue" />;
  };

  if (loading) return <TableSkeleton rows={5} cols={7} />;

  if (records.length === 0) {
    return (
      <EmptyState
        title="No DNS records found"
        description="Create your first DNS record to start routing traffic for this hosted zone."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="aws-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortKey = SORTABLE[header.id as keyof typeof SORTABLE];
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-aws-gray-700 uppercase tracking-wide whitespace-nowrap select-none",
                      sortKey && "cursor-pointer hover:text-aws-blue"
                    )}
                    onClick={() => sortKey && onSort(sortKey)}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortKey && <SortIcon col={sortKey} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                "cursor-pointer transition-colors",
                selectedIds.has(row.original.id) && "bg-aws-blue-light"
              )}
              onClick={() => toggleOne(row.original.id)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm border-b border-aws-gray-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
