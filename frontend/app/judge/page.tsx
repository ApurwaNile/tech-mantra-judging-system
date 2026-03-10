"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type AssignedEvent = {
  id: string;
  name: string;
};

export default function JudgeDashboard() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [judgeName, setJudgeName] = useState<string>("");
  const [judgeId, setJudgeId] = useState<string>("");
  const [events, setEvents] = useState<AssignedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem("judgeId") ?? "";
    const storedName = localStorage.getItem("judgeName") ?? "";

    if (!storedId) {
      router.push("/login");
      return;
    }

    setJudgeId(storedId);
    setJudgeName(storedName);

    const loadEvents = async () => {
      const { data } = await supabase
        .from("judge_assignments")
        .select("participants(event_id, events(id, name))")
        .eq("judge_id", storedId);

      const seen = new Set<string>();
      const uniqueEvents: AssignedEvent[] = [];

      (data ?? []).forEach((row: any) => {
        const event = row.participants?.events;
        if (event && !seen.has(event.id)) {
          seen.add(event.id);
          uniqueEvents.push({ id: event.id, name: event.name });
        }
      });

      setEvents(uniqueEvents);
      setLoading(false);
    };

    loadEvents();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <AppShell
      title="Judge Dashboard"
      subtitle="View your assigned events and start scoring"
      variant="default"
    >
      <div className="space-y-4">
        <Card title={`Welcome, ${judgeName}`}>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-black/60 transition hover:bg-black/5"
          >
            Logout
          </button>
        </Card>

        <Card title="Your events">
          {loading ? (
            <p className="text-sm text-black/50">Loading events…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-black/50">No events assigned yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/judge/participants?eventId=${event.id}`)}
                  className="rounded-xl border border-black/8 bg-white p-4 text-left transition hover:border-black/20 hover:shadow-sm"
                >
                  <p className="font-medium text-black/80">{event.name}</p>
                  <p className="mt-0.5 text-xs text-black/40">
                    View and score participants for this event.
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}