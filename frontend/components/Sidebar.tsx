"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Gavel, 
  ClipboardCheck, 
  Trophy,
  X,
  LogIn,
  LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Judges", href: "/admin/judges", icon: Gavel },
  { label: "Assignments", href: "/admin/assignments", icon: ClipboardCheck },
  { label: "Results", href: "/admin/results", icon: Trophy },
];

export function Sidebar({ 
  isOpen, 
  closeSidebar 
}: { 
  isOpen?: boolean;
  closeSidebar?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primaryDark font-bold text-xl tracking-tight">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-white text-xs">
              TM
            </div>
            TechMantra
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={closeSidebar}
            className="md:hidden p-1.5 text-textSecondary hover:bg-background rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem-100px)]">
          <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-textSecondary/70">
            Admin Menu
          </div>
          
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primaryDark" 
                    : "text-textSecondary hover:bg-background hover:text-textMain"
                }`}
                onClick={closeSidebar} // Close on mobile navigation
              >
                <item.icon size={18} className={isActive ? "text-primary text-opacity-80" : "text-opacity-50"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Auth Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-white space-y-1">
          <Link
             href="/login"
             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-textSecondary hover:bg-background hover:text-textMain"
             onClick={closeSidebar}
           >
             <LogIn size={18} className="text-opacity-50" />
             Login
           </Link>
           <Link
             href="/login"
             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-500 hover:bg-red-50 hover:text-red-700"
             onClick={closeSidebar}
           >
             <LogOut size={18} className="text-opacity-50" />
             Logout
           </Link>
        </div>
      </aside>
    </>
  );
}
