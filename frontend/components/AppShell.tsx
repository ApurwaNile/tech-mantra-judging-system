import Link from "next/link";
import { PropsWithChildren } from "react";

export function AppShell({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
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

