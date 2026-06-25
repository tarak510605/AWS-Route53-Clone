"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw, Trash2, ArrowLeft, Globe, Lock, Download } from "lucide-react";
import { useHostedZone } from "@/hooks/use-hosted-zones";
import { useDNSRecords, useDeleteDNSRecord, useBulkDeleteDNSRecords } from "@/hooks/use-dns-records";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { DNSRecordTable } from "@/features/dns-records/dns-record-table";
import { CreateDNSRecordModal } from "@/features/dns-records/create-dns-record-modal";
import { EditDNSRecordModal } from "@/features/dns-records/edit-dns-record-modal";
import { getApiError, formatDateShort } from "@/lib/utils";
import { DNS_RECORD_TYPES } from "@/types";
import type { DNSRecord } from "@/types";

interface HostedZoneDetailPageProps {
  zoneId: number;
}

export function HostedZoneDetailPage({ zoneId }: HostedZoneDetailPageProps) {
  const router = useRouter();

  // Zone data
  const { data: zone, isLoading: zoneLoading, isError: zoneError, error: zoneErr } = useHostedZone(zoneId);

  // Record list state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<DNSRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: records, isLoading: recordsLoading, isError: recordsError, error: recordsErr, refetch } = useDNSRecords(zoneId, {
    page,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    filter_type: filterType || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const deleteMutation = useDeleteDNSRecord(zoneId);
  const bulkDeleteMutation = useBulkDeleteDNSRecords(zoneId);

  const handleDeleteRecord = async () => {
    if (!deleteRecord) return;
    try {
      await deleteMutation.mutateAsync(deleteRecord.id);
      toast.success(`Record "${deleteRecord.name}" deleted`);
      setDeleteRecord(null);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`${result.deleted} record${result.deleted !== 1 ? "s" : ""} deleted`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleSort = useCallback((col: string) => {
    if (col === sortBy) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortOrder("asc"); }
    setPage(1);
  }, [sortBy]);

  const handleExportRecords = () => {
    if (!records) return;
    const csv = [
      ["Name", "Type", "TTL", "Value", "Routing Policy"].join(","),
      ...records.items.map((r) =>
        [r.name, r.type, r.ttl, `"${r.value.replace(/"/g, '""')}"`, r.routing_policy].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${zone?.zone_name || "records"}-dns-records.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported DNS records as CSV");
  };

  if (zoneLoading) return <PageSkeleton />;
  if (zoneError) return <ErrorState message={getApiError(zoneErr)} />;
  if (!zone) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="bg-white border-b border-aws-gray-200 px-6 py-4">
        <Breadcrumb
          items={[
            { label: "Route 53", href: "/hosted-zones" },
            { label: "Hosted zones", href: "/hosted-zones" },
            { label: zone.zone_name },
          ]}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/hosted-zones")}
              className="text-aws-gray-500 hover:text-aws-blue p-1 -ml-1"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-aws-gray-900 flex items-center gap-2">
                {zone.zone_name}
                {zone.private_zone ? (
                  <span className="badge-private flex items-center gap-1"><Lock size={10} />Private</span>
                ) : (
                  <span className="badge-public flex items-center gap-1"><Globe size={10} />Public</span>
                )}
              </h1>
              {zone.comment && <p className="text-sm text-aws-gray-500 mt-0.5">{zone.comment}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="btn-aws-secondary flex items-center gap-1.5 !py-1.5" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button onClick={handleExportRecords} className="btn-aws-secondary flex items-center gap-1.5 !py-1.5">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="btn-aws-primary flex items-center gap-1.5"
            >
              <Plus size={14} /> Create record
            </button>
          </div>
        </div>

        {/* Zone info strip */}
        <div className="mt-3 flex items-center gap-6 text-xs text-aws-gray-600">
          <span><strong>Hosted zone ID:</strong> Z{String(zone.id).padStart(13, "0")}</span>
          <span><strong>Record count:</strong> {zone.record_count}</span>
          <span><strong>Created:</strong> {formatDateShort(zone.created_at)}</span>
        </div>
      </div>

      {/* Records section */}
      <div className="px-6 py-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-aws-gray-800">
            Records <span className="text-aws-gray-500 font-normal text-sm">({records?.total || 0})</span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, value, or type"
            className="w-64"
          />
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue"
          >
            <option value="">All record types</option>
            {DNS_RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-aws-gray-600">{selectedIds.size} selected</span>
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="btn-aws-danger flex items-center gap-1.5 !py-1.5"
              >
                <Trash2 size={13} /> Delete selected
              </button>
            </div>
          )}
        </div>

        {recordsError ? (
          <ErrorState message={getApiError(recordsErr)} onRetry={() => refetch()} />
        ) : (
          <div className="aws-card flex flex-col flex-1">
            <DNSRecordTable
              records={records?.items || []}
              loading={recordsLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={setEditRecord}
              onDelete={setDeleteRecord}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={records?.total || 0}
              totalPages={records?.total_pages || 1}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateDNSRecordModal
        zoneId={zoneId}
        zoneName={zone.zone_name}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      {editRecord && (
        <EditDNSRecordModal
          record={editRecord}
          zoneId={zoneId}
          open={!!editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleteRecord}
        title="Delete DNS record"
        description={deleteRecord ? `Delete record "${deleteRecord.name}" (${deleteRecord.type})? This action cannot be undone.` : ""}
        confirmLabel="Delete record"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteRecord}
        onCancel={() => setDeleteRecord(null)}
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete records"
        description={`Delete ${selectedIds.size} selected record${selectedIds.size !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.size} record${selectedIds.size !== 1 ? "s" : ""}`}
        loading={bulkDeleteMutation.isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
