import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminEventsPage() {
  return (
    <AppShell title="Admin • Events" subtitle="Placeholder">
      <Card title="Manage events">
        <p className="text-sm text-black/70">
          This page will list events and allow creating/editing them. For now it’s a
          placeholder to establish routing and UI structure.
        </p>
      </Card>
    </AppShell>
  );
}

