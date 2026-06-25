"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-aws-gray-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-aws-red-light flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-aws-red" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-aws-gray-900">{title}</h2>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-aws-gray-700">{description}</p>
        </div>

        <div className="px-6 py-4 bg-aws-gray-50 border-t border-aws-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-aws-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={
              destructive ? "btn-aws-danger" : "btn-aws-primary"
            }
          >
            {loading && <Loader2 size={14} className="animate-spin inline mr-1.5" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
