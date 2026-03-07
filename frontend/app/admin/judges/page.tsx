import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AdminJudgesPage() {
  return (
    <AppShell title="Admin • Judges" subtitle="Placeholder">
      <Card title="Manage judges">
        <p className="text-sm text-black/70">
          This page will manage judge accounts and assignments. For now it’s a placeholder.
        </p>
      </Card>
    </AppShell>
  );
}

