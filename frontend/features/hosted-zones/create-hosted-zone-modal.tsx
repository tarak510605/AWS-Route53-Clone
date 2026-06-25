"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2, Info } from "lucide-react";
import { useCreateHostedZone } from "@/hooks/use-hosted-zones";
import { getApiError } from "@/lib/utils";

const schema = z.object({
  zone_name: z
    .string()
    .min(1, "Domain name is required")
    .max(255, "Domain name too long")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/, {
      message: "Invalid domain name format",
    }),
  comment: z.string().max(256, "Comment too long").optional(),
  private_zone: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
});

type FormData = z.infer<typeof schema>;

interface CreateHostedZoneModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateHostedZoneModal({ open, onClose }: CreateHostedZoneModalProps) {
  const createMutation = useCreateHostedZone();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { zone_name: "", comment: "", private_zone: "false" as unknown as boolean },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const zone = await createMutation.mutateAsync(data);
      toast.success(`Hosted zone "${zone.zone_name}" created successfully`);
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
      <div className="relative bg-white rounded shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-aws-gray-200 bg-aws-gray-50">
          <h2 className="text-base font-semibold text-aws-gray-900">Create hosted zone</h2>
          <button onClick={handleClose} className="text-aws-gray-500 hover:text-aws-gray-700 p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-5">
            {/* Domain name */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Domain name <span className="text-aws-red">*</span>
              </label>
              <p className="text-xs text-aws-gray-500 mb-1.5">
                Enter your domain name (e.g., example.com). A trailing dot will be added automatically.
              </p>
              <input
                {...register("zone_name")}
                type="text"
                placeholder="example.com"
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
              />
              {errors.zone_name && (
                <p className="text-aws-red text-xs mt-1 flex items-center gap-1">
                  <Info size={12} /> {errors.zone_name.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Type
              </label>
              <p className="text-xs text-aws-gray-500 mb-2">
                Choose whether this hosted zone routes traffic on the internet or within a VPC.
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register("private_zone")}
                    value="false"
                    defaultChecked
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-aws-gray-800">Public hosted zone</span>
                    <p className="text-xs text-aws-gray-500">Routes traffic on the internet</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register("private_zone")}
                    value="true"
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-aws-gray-800">Private hosted zone</span>
                    <p className="text-xs text-aws-gray-500">Routes traffic within an Amazon VPC</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-aws-gray-800 mb-1">
                Description <span className="text-aws-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                {...register("comment")}
                rows={2}
                placeholder="Add a description for this hosted zone"
                className="w-full border border-aws-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue resize-none"
              />
              {errors.comment && (
                <p className="text-aws-red text-xs mt-1">{errors.comment.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
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
              Create hosted zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
