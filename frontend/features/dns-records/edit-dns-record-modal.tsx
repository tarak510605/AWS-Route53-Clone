"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { useUpdateDNSRecord } from "@/hooks/use-dns-records";
import { getApiError } from "@/lib/utils";
import { DNS_RECORD_TYPES, ROUTING_POLICIES } from "@/types";
import type { DNSRecord } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Record name is required").max(255),
  type: z.string().min(1, "Record type is required"),
  value: z.string().min(1, "Value is required"),
  ttl: z
    .number({ invalid_type_error: "TTL must be a number" })
    .min(0, "TTL must be non-negative")
    .max(2147483647),
  routing_policy: z.string(),
});

type FormData = z.infer<typeof schema>;

interface EditDNSRecordModalProps {
  record: DNSRecord;
  zoneId: number;
  open: boolean;
  onClose: () => void;
}

export function EditDNSRecordModal({ record, zoneId, open, onClose }: EditDNSRecordModalProps) {
  const updateMutation = useUpdateDNSRecord(zoneId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: record.ttl,
      routing_policy: record.routing_policy,
    },
  });

  useEffect(() => {
    reset({
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: record.ttl,
      routing_policy: record.routing_policy,
    });
  }, [record, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateMutation.mutateAsync({ id: record.id, data });
      toast.success(`Record "${updated.name}" (${updated.type}) updated`);
      onClose();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-xl w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-aws-gray-200 bg-aws-gray-50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-aws-gray-900">Edit DNS record</h2>
            <p className="text-xs text-aws-gray-500 mt-0.5 font-mono">{record.name} ({record.type})</p>
          </div>
          <button onClick={onClose} className="text-aws-gray-500 hover:text-aws-gray-700 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Record name */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Record name <span className="text-aws-red">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              />
              {errors.name && <p className="text-aws-red text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Record type */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Record type <span className="text-aws-red">*</span>
              </label>
              <select
                {...register("type")}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue"
              >
                {DNS_RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-aws-red text-xs mt-1">{errors.type.message}</p>}
            </div>

            {/* TTL */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                TTL (seconds) <span className="text-aws-red">*</span>
              </label>
              <input
                {...register("ttl", { valueAsNumber: true })}
                type="number"
                min={0}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              />
              {errors.ttl && <p className="text-aws-red text-xs mt-1">{errors.ttl.message}</p>}
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Value <span className="text-aws-red">*</span>
              </label>
              <textarea
                {...register("value")}
                rows={4}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue resize-none"
              />
              {errors.value && <p className="text-aws-red text-xs mt-1">{errors.value.message}</p>}
            </div>

            {/* Routing policy */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Routing policy
              </label>
              <select
                {...register("routing_policy")}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue"
              >
                {ROUTING_POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-aws-gray-50 border-t border-aws-gray-200">
            <button type="button" onClick={onClose} className="btn-aws-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-aws-primary flex items-center gap-1.5"
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
