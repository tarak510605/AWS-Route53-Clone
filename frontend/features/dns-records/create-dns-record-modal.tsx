"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2, Info } from "lucide-react";
import { useCreateDNSRecord } from "@/hooks/use-dns-records";
import { getApiError } from "@/lib/utils";
import { DNS_RECORD_TYPES, ROUTING_POLICIES } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Record name is required").max(255),
  type: z.string().min(1, "Record type is required"),
  value: z.string().min(1, "Value is required"),
  ttl: z
    .number({ invalid_type_error: "TTL must be a number" })
    .min(0, "TTL must be non-negative")
    .max(2147483647, "TTL too large"),
  routing_policy: z.string().default("Simple"),
});

type FormData = z.infer<typeof schema>;

interface CreateDNSRecordModalProps {
  zoneId: number;
  zoneName: string;
  open: boolean;
  onClose: () => void;
}

const TTL_PRESETS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
  { label: "Custom", value: -1 },
];

const RECORD_HELP: Record<string, string> = {
  A: "IPv4 address (e.g., 192.0.2.1)",
  AAAA: "IPv6 address (e.g., 2001:db8::1)",
  CNAME: "Canonical name / alias (e.g., www.example.com.)",
  TXT: "Text data (e.g., \"v=spf1 include:_spf.example.com ~all\")",
  MX: "Mail server with priority (e.g., 10 mail.example.com.)",
  NS: "Name server (e.g., ns1.example.com.)",
  PTR: "Reverse DNS pointer (e.g., hostname.example.com.)",
  SRV: "Service record (e.g., 10 20 5060 sipserver.example.com.)",
  CAA: "Certification Authority (e.g., 0 issue \"letsencrypt.org\")",
};

export function CreateDNSRecordModal({ zoneId, zoneName, open, onClose }: CreateDNSRecordModalProps) {
  const createMutation = useCreateDNSRecord(zoneId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "A",
      value: "",
      ttl: 300,
      routing_policy: "Simple",
    },
  });

  const selectedType = watch("type");
  const ttlValue = watch("ttl");

  const onSubmit = async (data: FormData) => {
    try {
      const record = await createMutation.mutateAsync(data);
      toast.success(`DNS record "${record.name}" (${record.type}) created`);
      reset();
      onClose();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded shadow-xl w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-aws-gray-200 bg-aws-gray-50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-aws-gray-900">Create DNS record</h2>
            <p className="text-xs text-aws-gray-500 mt-0.5">{zoneName}</p>
          </div>
          <button onClick={handleClose} className="text-aws-gray-500 hover:text-aws-gray-700 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Record name */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Record name <span className="text-aws-red">*</span>
              </label>
              <div className="flex items-center gap-0">
                <input
                  {...register("name")}
                  type="text"
                  placeholder="www"
                  className="flex-1 border border-aws-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
                />
                <span className="border border-l-0 border-aws-gray-300 bg-aws-gray-50 px-3 py-2 text-sm text-aws-gray-500 rounded-r whitespace-nowrap">
                  .{zoneName}
                </span>
              </div>
              {errors.name && (
                <p className="text-aws-red text-xs mt-1 flex items-center gap-1">
                  <Info size={12} /> {errors.name.message}
                </p>
              )}
            </div>

            {/* Record type */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Record type <span className="text-aws-red">*</span>
              </label>
              <select
                {...register("type")}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              >
                {DNS_RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {selectedType && RECORD_HELP[selectedType] && (
                <p className="text-xs text-aws-gray-500 mt-1 flex items-center gap-1">
                  <Info size={11} /> {RECORD_HELP[selectedType]}
                </p>
              )}
              {errors.type && <p className="text-aws-red text-xs mt-1">{errors.type.message}</p>}
            </div>

            {/* TTL */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                TTL (seconds) <span className="text-aws-red">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register("ttl", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className="flex-1 border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
                />
                <select
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 0) setValue("ttl", v);
                  }}
                  className="border border-aws-gray-300 rounded px-2 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue"
                  defaultValue=""
                >
                  <option value="" disabled>Presets</option>
                  {TTL_PRESETS.filter(p => p.value >= 0).map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              {errors.ttl && <p className="text-aws-red text-xs mt-1">{errors.ttl.message}</p>}
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Value <span className="text-aws-red">*</span>
              </label>
              <textarea
                {...register("value")}
                rows={3}
                placeholder={RECORD_HELP[selectedType] || "Enter record value"}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue resize-none"
              />
              {errors.value && <p className="text-aws-red text-xs mt-1">{errors.value.message}</p>}
            </div>

            {/* Routing policy */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Routing policy
              </label>
              <select
                {...register("routing_policy")}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              >
                {ROUTING_POLICIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-aws-gray-50 border-t border-aws-gray-200">
            <button type="button" onClick={handleClose} className="btn-aws-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-aws-primary flex items-center gap-1.5"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Create record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
