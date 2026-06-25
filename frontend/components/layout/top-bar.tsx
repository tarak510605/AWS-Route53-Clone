"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Bell, HelpCircle, Globe, Search, User2, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <header className="bg-aws-navy text-white" style={{ minHeight: 36 }}>
      {/* Top navigation bar */}
      <div className="flex items-center h-9 px-4 gap-1">
        {/* AWS Logo */}
        <Link href="/hosted-zones" className="flex items-center gap-2 mr-4 hover:opacity-80">
          <svg width="40" height="24" viewBox="0 0 100 60" fill="white">
            <text x="0" y="45" fontSize="48" fontWeight="bold" fill="white" fontFamily="Arial">aws</text>
          </svg>
        </Link>

        {/* Services dropdown */}
        <div className="relative">
          <button
            onClick={() => setServicesOpen(!servicesOpen)}
            className="flex items-center gap-1 text-sm text-white/90 hover:text-white px-2 py-1 rounded hover:bg-white/10"
          >
            Services <ChevronDown size={12} />
          </button>
          {servicesOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded shadow-lg z-50 py-1 text-aws-gray-800">
              <div className="px-3 py-2 text-xs font-semibold text-aws-gray-500 uppercase">Networking</div>
              <Link href="/hosted-zones" className="block px-4 py-2 text-sm hover:bg-aws-blue-light" onClick={() => setServicesOpen(false)}>Route 53</Link>
              <Link href="/hosted-zones" className="block px-4 py-2 text-sm text-aws-gray-400 cursor-not-allowed">VPC</Link>
              <Link href="/hosted-zones" className="block px-4 py-2 text-sm text-aws-gray-400 cursor-not-allowed">CloudFront</Link>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-sm mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search services, features, blogs, docs, and more"
              className="w-full bg-white/10 text-white placeholder-white/40 text-xs pl-8 pr-3 py-1 rounded border border-white/20 focus:outline-none focus:border-aws-orange focus:bg-white/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Region */}
          <button className="flex items-center gap-1 text-sm text-white/90 hover:text-white px-2 py-1 rounded hover:bg-white/10">
            <Globe size={14} />
            <span className="text-xs">us-east-1</span>
            <ChevronDown size={12} />
          </button>

          {/* Support */}
          <button className="flex items-center gap-1 text-sm text-white/90 hover:text-white px-2 py-1 rounded hover:bg-white/10">
            <span className="text-xs">Support</span>
            <ChevronDown size={12} />
          </button>

          {/* Notifications */}
          <button className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10">
            <Bell size={16} />
          </button>

          {/* Help */}
          <button className="text-white/90 hover:text-white p-1 rounded hover:bg-white/10">
            <HelpCircle size={16} />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 text-sm text-white/90 hover:text-white px-2 py-1 rounded hover:bg-white/10"
            >
              <User2 size={14} />
              <span className="text-xs max-w-[120px] truncate">{user?.email?.split("@")[0] || "User"}</span>
              <ChevronDown size={12} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded shadow-lg z-50 py-1 text-aws-gray-800">
                <div className="px-4 py-2 text-xs text-aws-gray-500 border-b border-aws-gray-200">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-aws-blue-light text-left"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary service bar */}
      <div className="bg-[#2C3E50] px-4 py-1.5 flex items-center gap-1 text-xs text-white/80">
        <Link href="/hosted-zones" className="hover:text-white hover:underline">Route 53</Link>
        <span className="text-white/40 mx-1">›</span>
        <span className="text-aws-orange">Hosted Zones</span>
      </div>
    </header>
  );
}
