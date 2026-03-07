"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function JudgeDashboardPage() {
  return (
    <AppShell title="Judge Dashboard" subtitle="View assignments and submit scores">
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Assigned participants">
          <p className="text-sm text-black/70">
            Placeholder: show the participants assigned to the current judge.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/judge/participants">
              View assignments
            </Link>
          </div>
        </Card>

        <Card title="Submit scores">
          <p className="text-sm text-black/70">
            Placeholder: score a participant and submit via `/api/scores`.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/judge/scores">
              Submit a score
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

