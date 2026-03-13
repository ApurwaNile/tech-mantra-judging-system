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
  const [impersonatingAdmin, setImpersonatingAdmin] = useState(false);
  const [adminReturnPath, setAdminReturnPath] = useState<string>("/admin/judges");

  useEffect(() => {
    const storedId = localStorage.getItem("judgeId") ?? "";
    const storedName = localStorage.getItem("judgeName") ?? "";
    const isImpersonating = localStorage.getItem("impersonatingAdmin") === "true";
    const returnPath = localStorage.getItem("adminReturnPath") ?? "/admin/judges";

    if (!storedId) {
      router.push("/login");
      return;
    }

    setJudgeId(storedId);
    setJudgeName(storedName);
    setImpersonatingAdmin(isImpersonating);
    setAdminReturnPath(returnPath);

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
          <div className="flex items-center justify-between gap-3">
            {impersonatingAdmin && (
              <button
                type="button"
                onClick={() => router.push(adminReturnPath)}
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: "rgba(148,163,184,0.5)",
                  color: "#cbd5e1",
                  background: "transparent",
                }}
              >
                ← Back to Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="ml-auto rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                border: "1px solid rgba(148,163,184,0.6)",
                color: "#e2e8f0",
                background: "rgba(15,23,42,0.7)",
              }}
              type="button"
            >
              Logout
            </button>
          </div>
        </Card>

        <Card title="Your events">
          {loading ? (
            <p className="text-sm" style={{ color: "#64748b" }}>
              Loading events…
            </p>
          ) : events.length === 0 ? (
            <p className="text-sm" style={{ color: "#64748b" }}>
              No events assigned yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/judge/participants?eventId=${event.id}`)}
                  className="rounded-xl p-4 text-left transition"
                  style={{
                    border: "1px solid rgba(148,163,184,0.35)",
                    background: "rgba(15,23,42,0.85)",
                    color: "#e2e8f0",
                  }}
                >
                  <p className="font-medium" style={{ color: "#e2e8f0" }}>
                    {event.name}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>
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