"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function EventsPage() {
  const supabase = getSupabaseClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
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

  const createEvent = async () => {
    const { error } = await supabase.from("events").insert({
      name: name,
      description: description,
    } as any);

    if (error) {
      setMessage("Error creating event");
      console.error(error);
    } else {
      setMessage("Event created successfully");
      setName("");
      setDescription("");
      loadEvents();
    }
  };

  return (
    <AppShell
      title="Events"
      subtitle="Create and manage competition events"
      variant="admin"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        <Card title="Create Event">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createEvent();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Event name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="E.g. Tech Mantra Hackathon"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="Short summary for judges and participants"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-black/50">
                New events appear immediately in the list.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90"
              >
                Create event
              </button>
            </div>

            {message ? (
              <p className="text-xs text-black/70" aria-live="polite">
                {message}
              </p>
            ) : null}
          </form>
        </Card>

        <Card title="All Events">
          {events.length === 0 ? (
            <p className="text-sm text-black/50">No events created yet.</p>
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
      </div>
    </AppShell>
  );
}
