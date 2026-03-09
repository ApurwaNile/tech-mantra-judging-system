"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminDashboardPage() {
  return (
    <AppShell title="Admin Dashboard" subtitle="Create events, manage judges & participants">
      <div className="grid gap-6 md:grid-cols-2">

        <Card title="Manage Events">
          <p className="text-sm text-black/70">
            Create and manage competition events.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/events">
              Go to Events
            </Link>
          </div>
        </Card>

        <Card title="Manage Participants">
          <p className="text-sm text-black/70">
            Register participants and link them to events.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/participants">
              Go to Participants
            </Link>
          </div>
        </Card>

        <Card title="Manage Judges">
          <p className="text-sm text-black/70">
            Add judges and manage judge accounts.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/judges">
              Go to Judges
            </Link>
          </div>
        </Card>

        <Card title="Judge Assignments">
          <p className="text-sm text-black/70">
            Assign judges to participants.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/assignments">
              Go to Assignments
            </Link>
          </div>
        </Card>

        <Card title="View Results">
          <p className="text-sm text-black/70">
            See leaderboard and final scores.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/results">
              View Results
            </Link>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}