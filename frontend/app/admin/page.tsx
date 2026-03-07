"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminDashboardPage() {
  return (
    <AppShell title="Admin Dashboard" subtitle="Create events, manage judges & participants">

<a href="/admin/events">Manage Events</a>
<br />
<a href="/admin/participants">Manage Participants</a>
<br />
<a href="/admin/judges">Manage Judges</a>
<br />
<a href="/admin/assignments">Assign Judges</a>
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Manage Events">
          <p className="text-sm text-black/70">
            Placeholder: create/edit events, set scoring criteria, assign judges.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/events">
              Go to Events
            </Link>
          </div>
        </Card>

        <Card title="Manage Judges">
          <p className="text-sm text-black/70">
            Placeholder: invite judges, assign them to events/participants.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/judges">
              Go to Judges
            </Link>
          </div>
        </Card>

        <Card title="Manage Participants">
          <p className="text-sm text-black/70">
            Placeholder: register participants and link them to events.
          </p>
          <div className="mt-3 text-sm">
            <Link className="underline" href="/admin/participants">
              Go to Participants
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

