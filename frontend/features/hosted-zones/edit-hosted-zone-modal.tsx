"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2, Globe, Lock } from "lucide-react";
import { useUpdateHostedZone } from "@/hooks/use-hosted-zones";
import { getApiError } from "@/lib/utils";
import type { HostedZone } from "@/types";

const schema = z.object({
  comment: z.string().max(256).optional(),
  private_zone: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true"),
});

type FormData = z.infer<typeof schema>;

interface EditHostedZoneModalProps {
  zone: HostedZone;
  open: boolean;
  onClose: () => void;
}

export function EditHostedZoneModal({ zone, open, onClose }: EditHostedZoneModalProps) {
  const updateMutation = useUpdateHostedZone();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      comment: zone.comment || "",
      private_zone: zone.private_zone,
    },
  });

  useEffect(() => {
    reset({ comment: zone.comment || "", private_zone: zone.private_zone });
  }, [zone, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await updateMutation.mutateAsync({ id: zone.id, data });
      toast.success(`Hosted zone "${updated.zone_name}" updated`);
      onClose();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-aws-gray-200 bg-aws-gray-50">
          <div>
            <h2 className="text-base font-semibold text-aws-gray-900">Edit hosted zone</h2>
            <p className="text-xs text-aws-gray-500 mt-0.5">{zone.zone_name}</p>
          </div>
          <button onClick={onClose} className="text-aws-gray-500 hover:text-aws-gray-700 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-4">
            {/* Zone name (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Domain name
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-aws-gray-50 border border-aws-gray-200 rounded text-sm text-aws-gray-600">
                {zone.private_zone ? <Lock size={14} className="text-aws-blue" /> : <Globe size={14} className="text-aws-green" />}
                {zone.zone_name}
              </div>
              <p className="text-xs text-aws-gray-400 mt-1">Zone name cannot be changed after creation</p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-2 uppercase tracking-wide">
                Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register("private_zone")}
                    value="false"
                    defaultChecked={!zone.private_zone}
                    className="text-aws-blue"
                  />
                  <span className="text-sm text-aws-gray-800">Public hosted zone</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register("private_zone")}
                    value="true"
                    defaultChecked={zone.private_zone}
                    className="text-aws-blue"
                  />
                  <span className="text-sm text-aws-gray-800">Private hosted zone</span>
                </label>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-aws-gray-700 mb-1 uppercase tracking-wide">
                Description
              </label>
              <textarea
                {...register("comment")}
                rows={3}
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue resize-none"
              />
              {errors.comment && (
                <p className="text-aws-red text-xs mt-1">{errors.comment.message}</p>
              )}
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
