"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Pencil, Trash2, Globe, Lock } from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { HostedZone } from "@/types";

interface HostedZoneTableProps {
  zones: HostedZone[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  onView: (zone: HostedZone) => void;
  onEdit: (zone: HostedZone) => void;
  onDelete: (zone: HostedZone) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: string) => void;
}

const columnHelper = createColumnHelper<HostedZone>();

export function HostedZoneTable({
  zones,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: HostedZoneTableProps) {
  const allSelected = zones.length > 0 && zones.every((z) => selectedIds.has(z.id));
  const someSelected = zones.some((z) => selectedIds.has(z.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(zones.map((z) => z.id)));
    }
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
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleOne(row.original.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-aws-gray-400 text-aws-blue cursor-pointer"
          aria-label={`Select ${row.original.zone_name}`}
        />
      ),
      size: 40,
    }),
    columnHelper.accessor("zone_name", {
      header: "Hosted zone name",
      cell: (info) => (
        <button
          onClick={() => onView(info.row.original)}
          className="text-aws-blue hover:text-aws-blue-dark hover:underline font-medium text-left"
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor("private_zone", {
      header: "Type",
      cell: (info) =>
        info.getValue() ? (
          <span className="badge-private flex items-center gap-1 w-fit">
            <Lock size={10} />
            Private
          </span>
        ) : (
          <span className="badge-public flex items-center gap-1 w-fit">
            <Globe size={10} />
            Public
          </span>
        ),
    }),
    columnHelper.accessor("record_count", {
      header: "Record count",
      cell: (info) => (
        <span className="font-mono text-aws-gray-700">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => (
        <span className="text-aws-gray-600 truncate max-w-[200px] block">
          {info.getValue() || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: (info) => (
        <span className="text-aws-gray-600 text-xs whitespace-nowrap">
          {formatDateShort(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onView(row.original)}
            title="View records"
            className="p-1.5 text-aws-gray-500 hover:text-aws-blue hover:bg-aws-blue-light rounded"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onEdit(row.original)}
            title="Edit"
            className="p-1.5 text-aws-gray-500 hover:text-aws-blue hover:bg-aws-blue-light rounded"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(row.original)}
            title="Delete"
            className="p-1.5 text-aws-gray-500 hover:text-aws-red hover:bg-aws-red-light rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: zones,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const SORTABLE_COLUMNS: Record<string, string> = {
    zone_name: "zone_name",
    private_zone: "private_zone",
    record_count: "record_count",
    created_at: "created_at",
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={12} className="text-aws-blue" />
    ) : (
      <ArrowDown size={12} className="text-aws-blue" />
    );
  };

  if (zones.length === 0) {
    return (
      <EmptyState
        title="No hosted zones found"
        description="Create your first hosted zone to get started with Route 53 DNS management."
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
                const sortKey = SORTABLE_COLUMNS[header.id];
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-aws-gray-700 uppercase tracking-wide whitespace-nowrap select-none",
                      sortKey && "cursor-pointer hover:text-aws-blue"
                    )}
                    onClick={() => sortKey && onSort(sortKey)}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
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
