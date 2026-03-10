"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function EventsPage() {
  const supabase = getSupabaseClient();

  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setEvents(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <AppShell
      title="Events"
      subtitle="View configured competition events"
      variant="admin"
    >
      <Card title="All Events">
        {events.length === 0 ? (
          <p className="text-sm text-black/50">
            No events found. Preconfigured events should appear here.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/5">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead className="bg-neutral-50">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Created</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr
                    key={event.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}
                  >
                    <td className="px-4 py-3 font-medium text-black/80">
                      {event.name}
                    </td>
                    <td className="px-4 py-3 text-black/70">
                      {event.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-black/50">
                      {event.created_at
                        ? new Date(event.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
