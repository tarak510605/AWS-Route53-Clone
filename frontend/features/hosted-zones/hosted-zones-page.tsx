"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw, Download, Trash2 } from "lucide-react";
import {
  useHostedZones,
  useDeleteHostedZone,
} from "@/hooks/use-hosted-zones";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { HostedZoneTable } from "@/features/hosted-zones/hosted-zone-table";
import { CreateHostedZoneModal } from "@/features/hosted-zones/create-hosted-zone-modal";
import { EditHostedZoneModal } from "@/features/hosted-zones/edit-hosted-zone-modal";
import type { HostedZone } from "@/types";
import { getApiError } from "@/lib/utils";

export function HostedZonesPage() {
  const router = useRouter();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [editZone, setEditZone] = useState<HostedZone | null>(null);
  const [deleteZone, setDeleteZone] = useState<HostedZone | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useHostedZones({
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    filter_type: filterType || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const deleteMutation = useDeleteHostedZone();

  const handleDelete = async () => {
    if (!deleteZone) return;
    try {
      await deleteMutation.mutateAsync(deleteZone.id);
      toast.success(`Hosted zone "${deleteZone.zone_name}" deleted`);
      setDeleteZone(null);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleSort = useCallback((col: string) => {
    if (col === sortBy) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
    setPage(1);
  }, [sortBy]);

  const handleViewZone = useCallback(
    (zone: HostedZone) => router.push(`/hosted-zones/${zone.id}`),
    [router]
  );

  const handleExport = () => {
    if (!data) return;
    const csv = [
      ["Zone Name", "Type", "Record Count", "Comment", "Created At"].join(","),
      ...data.items.map((z) =>
        [
          z.zone_name,
          z.private_zone ? "Private" : "Public",
          z.record_count,
          `"${z.comment?.replace(/"/g, '""') || ""}"`,
          z.created_at,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hosted-zones.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported hosted zones as CSV");
  };

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState message={getApiError(error)} onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="bg-white border-b border-aws-gray-200 px-6 py-4">
        <Breadcrumb items={[{ label: "Route 53", href: "/hosted-zones" }, { label: "Hosted zones" }]} />
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-semibold text-aws-gray-900">Hosted zones</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="btn-aws-secondary flex items-center gap-1.5 !py-1.5"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleExport}
              className="btn-aws-secondary flex items-center gap-1.5 !py-1.5"
              title="Export as CSV"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="btn-aws-primary flex items-center gap-1.5"
            >
              <Plus size={14} />
              Create hosted zone
            </button>
          </div>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="bg-white border-b border-aws-gray-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or comment"
          className="w-64"
        />
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          className="border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue"
        >
          <option value="">All types</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        {selectedIds.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-aws-gray-600">{selectedIds.size} selected</span>
            <button
              className="btn-aws-danger flex items-center gap-1.5 !py-1.5"
              onClick={() => {
                const zone = data?.items.find((z) => selectedIds.has(z.id));
                if (zone) setDeleteZone(zone);
              }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="aws-card mx-6 my-4 flex flex-col flex-1">
          <HostedZoneTable
            zones={data?.items || []}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onView={handleViewZone}
            onEdit={setEditZone}
            onDelete={setDeleteZone}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
            totalPages={data?.total_pages || 1}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateHostedZoneModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      {editZone && (
        <EditHostedZoneModal
          zone={editZone}
          open={!!editZone}
          onClose={() => setEditZone(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleteZone}
        title="Delete hosted zone"
        description={
          deleteZone
            ? `Are you sure you want to delete "${deleteZone.zone_name}"? This will permanently delete the hosted zone and all its DNS records. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete hosted zone"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteZone(null)}
      />
    </div>
  );
}
