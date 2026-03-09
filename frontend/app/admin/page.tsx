"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminDashboardPage() {
  return (
    <AppShell
      title="Admin Dashboard"
      subtitle="Create events, manage judges & participants"
      variant="admin"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Manage Events">
          <p className="text-sm text-black/70">
            Create and manage competition events.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">Create new events and edit details.</span>
            <Link
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/80 transition hover:bg-black hover:text-white"
              href="/admin/events"
            >
              Go to Events
            </Link>
          </div>
        </Card>

        <Card title="Manage Participants">
          <p className="text-sm text-black/70">
            Register participants and link them to events.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">Onboard participants and manage registrations.</span>
            <Link
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/80 transition hover:bg-black hover:text-white"
              href="/admin/participants"
            >
              Go to Participants
            </Link>
          </div>
        </Card>

        <Card title="Manage Judges">
          <p className="text-sm text-black/70">
            Add judges and manage judge accounts.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">Configure judge profiles and access.</span>
            <Link
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/80 transition hover:bg-black hover:text-white"
              href="/admin/judges"
            >
              Go to Judges
            </Link>
          </div>
        </Card>

        <Card title="Judge Assignments">
          <p className="text-sm text-black/70">
            Assign judges to participants.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">Control which judges score which participants.</span>
            <Link
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/80 transition hover:bg-black hover:text-white"
              href="/admin/assignments"
            >
              Go to Assignments
            </Link>
          </div>
        </Card>

        <Card title="View Results">
          <p className="text-sm text-black/70">
            See leaderboard and final scores.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/50">Track standings and final rankings.</span>
            <Link
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/80 transition hover:bg-black hover:text-white"
              href="/admin/results"
            >
              View Results
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
