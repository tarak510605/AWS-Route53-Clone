"use client";

import { Globe } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 bg-aws-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || <Globe size={28} className="text-aws-gray-400" />}
      </div>
      <h3 className="text-base font-semibold text-aws-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-aws-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 bg-aws-red-light rounded-full flex items-center justify-center mb-4">
        <span className="text-aws-red text-2xl font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold text-aws-gray-800 mb-1">Something went wrong</h3>
      <p className="text-sm text-aws-gray-500 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-aws-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
