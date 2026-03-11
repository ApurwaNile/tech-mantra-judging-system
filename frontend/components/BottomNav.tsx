"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings
} from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings }, // Example additional mobile link
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? "text-primaryDark" 
                  : "text-textSecondary hover:text-textMain"
              }`}
              style={{"WebkitTapHighlightColor": "transparent"}}
            >
              <item.icon size={22} className={isActive ? "text-primary" : "text-opacity-70"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
