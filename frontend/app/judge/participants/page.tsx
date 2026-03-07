import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function JudgeParticipantsPage() {
  return (
    <AppShell title="Judge • Assigned participants" subtitle="Placeholder">
      <Card title="Assignments">
        <p className="text-sm text-black/70">
          This will list participants assigned to the judge (likely via an assignment table).
          For now it’s a placeholder.
        </p>
      </Card>
    </AppShell>
  );
}

