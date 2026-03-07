"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { UserRole } from "@/types/models";

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setRole((localStorage.getItem("tmjs_role") as UserRole) ?? null);
    getSupabaseClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  async function signOut() {
    await getSupabaseClient().auth.signOut();
    localStorage.removeItem("tmjs_role");
    window.location.href = "/login";
  }

  return (
    <AppShell title="Dashboard" subtitle={email ? `Signed in as ${email}` : ""}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Portals">
          <div className="space-y-2 text-sm">
            <div>
              <Link className="underline" href="/admin">
                Admin Dashboard
              </Link>
            </div>
            <div>
              <Link className="underline" href="/judge">
                Judge Dashboard
              </Link>
            </div>
            {role ? (
              <div className="mt-2 text-xs text-black/60">
                Selected role (placeholder): <span className="font-medium">{role}</span>
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Session">
          <div className="space-y-3 text-sm">
            <div>
              This base project uses Supabase Auth in the browser. Protected routing and
              role enforcement will be added later.
            </div>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

