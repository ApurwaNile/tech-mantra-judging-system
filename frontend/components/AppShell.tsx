import Link from "next/link";
import { PropsWithChildren } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  variant?: "default" | "admin";
};

export function AppShell({
  title,
  subtitle,
  variant = "default",
  children,
}: PropsWithChildren<AppShellProps>) {
  if (variant === "admin") {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <div className="text-base font-semibold">{title}</div>
              {subtitle ? (
                <div className="text-sm text-black/60">{subtitle}</div>
              ) : null}
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link className="hover:underline" href="/dashboard">
                Dashboard
              </Link>
              <Link className="hover:underline" href="/login">
                Logout
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">
          <aside className="w-56 shrink-0">
            <div className="rounded-xl border border-black/10 bg-white p-4 text-sm shadow-sm">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
                Admin Navigation
              </div>
              <nav className="flex flex-col gap-1">
                <SidebarLink href="/admin" label="Overview" />
                <SidebarLink href="/admin/events" label="Events" />
                <SidebarLink href="/admin/participants" label="Participants" />
                <SidebarLink href="/admin/judges" label="Judges" />
                <SidebarLink href="/admin/assignments" label="Assignments" />
                <SidebarLink href="/admin/results" label="Results" />
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="space-y-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-base font-semibold">{title}</div>
            {subtitle ? (
              <div className="text-sm text-black/60">{subtitle}</div>
            ) : null}
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:underline" href="/login">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-black/80 transition hover:bg-neutral-100 hover:text-black"
    >
      <span>{label}</span>
      <span className="text-xs text-black/40">↗</span>
    </Link>
  );
}

