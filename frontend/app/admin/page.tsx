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
          <p
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            View all competition events.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              View all competition events.
            </span>
            <Link
              href="/admin/events"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.6)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#818cf8",
                textDecoration: "none",
                background: "rgba(129,140,248,0.08)",
              }}
            >
              Go to Events
            </Link>
          </div>
        </Card>

        <Card title="Manage Participants">
          <p
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            Register participants and link them to events.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Onboard participants and manage registrations.
            </span>
            <Link
              href="/admin/participants"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.6)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#818cf8",
                textDecoration: "none",
                background: "rgba(129,140,248,0.08)",
              }}
            >
              Go to Participants
            </Link>
          </div>
        </Card>

        <Card title="Manage Judges">
          <p
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            View all judges.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              View all judges.
            </span>
            <Link
              href="/admin/judges"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.6)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#818cf8",
                textDecoration: "none",
                background: "rgba(129,140,248,0.08)",
              }}
            >
              Go to Judges
            </Link>
          </div>
        </Card>

        <Card title="Judge Assignments">
          <p
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            Assign judges to participants.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Control which judges score which participants.
            </span>
            <Link
              href="/admin/assignments"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.6)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#818cf8",
                textDecoration: "none",
                background: "rgba(129,140,248,0.08)",
              }}
            >
              Go to Assignments
            </Link>
          </div>
        </Card>

        <Card title="View Results">
          <p
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            See leaderboard and final scores.
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>
              Track standings and final rankings.
            </span>
            <Link
              href="/admin/results"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.6)",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#818cf8",
                textDecoration: "none",
                background: "rgba(129,140,248,0.08)",
              }}
            >
              View Results
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
