"use client";

import { PropsWithChildren, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  variant?: "default" | "admin";
};

export function AppShell({
  title,
  subtitle,
  variant = "default",
  children,
}: PropsWithChildren<AppShellProps>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (variant === "admin") {
    return (
      <div className="min-h-screen bg-background text-textMain flex overflow-hidden">
        {/* Left Sidebar (Desktop & Mobile managed within component) */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={() => setIsSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-[100dvh]">
          <TopNav toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative z-0">
            <div className="mx-auto max-w-6xl">
              {(title || subtitle) && (
                <div className="mb-6">
                  {title && <h1 className="text-2xl font-bold tracking-tight text-textMain">{title}</h1>}
                  {subtitle && <p className="text-textSecondary text-sm mt-1">{subtitle}</p>}
                </div>
              )}
              {children}
            </div>
          </main>

          {/* Bottom Nav (Mobile) */}
          <BottomNav />
        </div>
      </div>
    );
  }

  // Default non-admin variant
  return (
    <div className="min-h-screen bg-background text-textMain flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopNav toggleSidebar={() => {}} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
             <div className="mx-auto max-w-5xl space-y-6">
                 {(title || subtitle) && (
                    <div className="mb-6">
                      {title && <h1 className="text-2xl font-bold tracking-tight text-textMain">{title}</h1>}
                      {subtitle && <p className="text-textSecondary text-sm mt-1">{subtitle}</p>}
                    </div>
                  )}
                 {children}
             </div>
          </main>
          <BottomNav />
        </div>
    </div>
  );
}

