"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Network,
  Activity,
  Shield,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/hosted-zones",
    icon: LayoutDashboard,
    active: false,
    disabled: false,
  },
  {
    label: "Hosted zones",
    href: "/hosted-zones",
    icon: Globe,
    active: true,
    disabled: false,
  },
  {
    label: "Traffic policies",
    href: "/traffic-policies",
    icon: Network,
    active: false,
    disabled: true,
  },
  {
    label: "Health checks",
    href: "/health-checks",
    icon: Activity,
    active: false,
    disabled: true,
  },
  {
    label: "Resolver",
    href: "/resolver",
    icon: Shield,
    active: false,
    disabled: true,
  },
  {
    label: "Profiles",
    href: "/profiles",
    icon: Users,
    active: false,
    disabled: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 border-r border-aws-gray-200 bg-white flex flex-col"
      style={{ minHeight: "calc(100vh - 72px)" }}
    >
      {/* Service header */}
      <div className="px-4 py-3 border-b border-aws-gray-200 bg-aws-gray-50">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-aws-orange" />
          <span className="text-xs font-semibold text-aws-gray-700 uppercase tracking-wide">
            Route 53
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/hosted-zones"
              ? pathname.startsWith("/hosted-zones")
              : pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                isActive
                  ? "bg-aws-blue-light text-aws-blue border-r-2 border-aws-blue font-medium"
                  : "text-aws-gray-700 hover:bg-aws-gray-100 hover:text-aws-gray-900",
                item.disabled && "opacity-50 cursor-default pointer-events-none"
              )}
            >
              <item.icon
                size={15}
                className={isActive ? "text-aws-blue" : "text-aws-gray-500"}
              />
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-xs text-aws-gray-400 bg-aws-gray-100 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-3 border-t border-aws-gray-200">
        <p className="text-xs text-aws-gray-400">Route 53 Console</p>
        <p className="text-xs text-aws-gray-300">v1.0.0</p>
      </div>
    </aside>
  );
}
