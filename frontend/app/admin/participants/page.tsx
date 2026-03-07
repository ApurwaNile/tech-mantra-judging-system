import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminParticipantsPage() {
  return (
    <AppShell title="Admin • Participants" subtitle="Placeholder">
      <Card title="Manage participants">
        <p className="text-sm text-black/70">
          This page will register participants and associate them to events. For now it’s a
          placeholder.
        </p>
      </Card>
    </AppShell>
  );
}

