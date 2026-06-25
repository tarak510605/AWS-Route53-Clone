"use client";

import { Clock } from "lucide-react";

interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8">
      <div className="w-16 h-16 bg-aws-gray-100 rounded-full flex items-center justify-center mb-4">
        <Clock size={32} className="text-aws-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-aws-gray-800 mb-2">{title}</h2>
      <p className="text-aws-gray-500 text-sm max-w-sm">
        This feature is coming soon. Only <strong>Hosted Zones</strong> is
        functional in this demo.
      </p>
      <div className="mt-4 px-3 py-1.5 bg-aws-orange-light border border-aws-orange/30 rounded text-xs text-aws-gray-700">
        Currently in development
      </div>
    </div>
  );
}
