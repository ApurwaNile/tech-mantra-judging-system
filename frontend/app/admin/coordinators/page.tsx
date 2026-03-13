"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type EventRow = {
  id: string;
  name: string;
};

type CoordinatorRow = {
  id: string;
  name: string;
  username: string;
  event_ids: string[] | null;
};

export default function CoordinatorsPage() {
  const supabase = getSupabaseClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [coordinators, setCoordinators] = useState<CoordinatorRow[]>([]);
  const [formState, setFormState] = useState<{
    name: string;
    username: string;
    password: string;
    eventIds: string[];
  }>({
    name: "",
    username: "",
    password: "",
    eventIds: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, name")
      .order("name", { ascending: true })
      .returns<EventRow[]>();
    if (data) setEvents(data);
  };

  const loadCoordinators = async () => {
    const { data } = await supabase
      .from("event_coordinators")
      .select("id, name, username, event_ids")
      .order("name", { ascending: true })
      .returns<CoordinatorRow[]>();
    if (data) setCoordinators(data);
  };

  useEffect(() => {
    loadEvents();
    loadCoordinators();
  }, []);

  const toggleEventSelection = (eventId: string) => {
    setFormState((prev) => {
      const exists = prev.eventIds.includes(eventId);
      return {
        ...prev,
        eventIds: exists
          ? prev.eventIds.filter((id) => id !== eventId)
          : [...prev.eventIds, eventId],
      };
    });
  };

  return (
    <AppShell
      title="Event Coordinators"
      subtitle="Manage coordinator accounts and event assignments"
      variant="admin"
    >
      <div className="space-y-4">
        <Card title="Create coordinator">
          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              setSubmitting(true);
              await supabase.from("event_coordinators").insert({
                name: formState.name.trim(),
                username: formState.username.trim(),
                password: formState.password,
                event_ids: formState.eventIds,
              });
              setFormState({
                name: "",
                username: "",
                password: "",
                eventIds: [],
              });
              await loadCoordinators();
              setSubmitting(false);
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Username
                </label>
                <input
                  type="text"
                  value={formState.username}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Password
              </label>
              <input
                type="password"
                value={formState.password}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                Assigned events
              </label>
              {events.length === 0 ? (
                <p className="text-xs text-black/50">
                  No events available yet. Create events first.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {events.map((event) => (
                    <label
                      key={event.id}
                      className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-black/80"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-black/40 text-black focus:ring-black/40"
                        checked={formState.eventIds.includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                      />
                      <span>{event.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create coordinator"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="All coordinators">
          {coordinators.length === 0 ? (
            <p className="text-sm text-black/50">
              No coordinators configured yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {coordinators.map((c, idx) => {
                    const eventNames =
                      (c.event_ids ?? [])
                        .map(
                          (id) => events.find((e) => e.id === id)?.name ?? null,
                        )
                        .filter((name): name is string => !!name) ?? [];
                    return (
                      <tr
                        key={c.id}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                        }
                      >
                        <td className="px-4 py-3 font-medium text-black/80">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-black/70">
                          {c.username}
                        </td>
                        <td className="px-4 py-3 text-black/70">
                          {eventNames.length > 0
                            ? eventNames.join(", ")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

