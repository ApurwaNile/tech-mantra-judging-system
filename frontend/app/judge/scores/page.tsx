import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function JudgeScoresPage() {
  return (
    <AppShell title="Judge • Submit scores" subtitle="Placeholder">
      <Card title="Score submission">
        <p className="text-sm text-black/70">
          This page will provide a scoring form and submit to `/api/scores`. For now it’s a
          placeholder.
        </p>
      </Card>
    </AppShell>
  );
}

