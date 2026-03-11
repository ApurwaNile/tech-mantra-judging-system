"use client";

import { Search, Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [role, setRole] = useState<"admin" | "judge">("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/admin/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRoleSwitch = (newRole: "admin" | "judge") => {
    setRole(newRole);
    if (newRole === "judge") router.push("/judge/dashboard");
    else router.push("/admin");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-textSecondary hover:bg-background rounded-full transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="font-bold text-lg text-primaryDark">TechMantra</div>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex items-center bg-background rounded-full px-4 py-2 w-full max-w-md border border-transparent focus-within:border-primary/30 transition-all shadow-inner">
        <Search size={18} className="text-textSecondary" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="bg-transparent border-none outline-none ml-2 text-sm text-textMain w-full placeholder:text-textSecondary"
        />
      </div>

      <div className="flex flex-1 justify-end md:hidden">
        <Search size={20} className="text-textSecondary mr-2 cursor-pointer" />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Role Switcher */}
        <div className="hidden sm:flex items-center bg-background rounded-full p-1 border border-border">
          <button
            onClick={() => handleRoleSwitch("admin")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              role === "admin"
                ? "bg-white shadow-sm text-primaryDark"
                : "text-textSecondary hover:text-textMain"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleSwitch("judge")}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              role === "judge"
                ? "bg-white shadow-sm text-primaryDark"
                : "text-textSecondary hover:text-textMain"
            }`}
          >
            Judge
          </button>
        </div>

        {/* Removed notifications block */}

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-border">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-textMain leading-tight">Admin User</span>
            <span className="text-xs text-textSecondary">Super Admin</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/30 cursor-pointer">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=eff6ff&color=2563eb" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
