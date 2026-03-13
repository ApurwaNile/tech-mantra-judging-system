"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type EventRow = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
  rounds: number;
  track: string | null;
};

type ScoringCriterion = {
  id: string;
  event_id: string;
  name: string;
  max_score: number;
  sort_order: number;
};

export default function EventsPage() {
  const supabase = getSupabaseClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    name: string;
    description: string;
    rounds: number;
    track: "NONE" | "TRACK_A" | "TRACK_B";
  }>({
    name: "",
    description: "",
    rounds: 1,
    track: "NONE",
  });
  const [savingEvent, setSavingEvent] = useState(false);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [criteriaDirty, setCriteriaDirty] = useState(false);
  const [savingCriteria, setSavingCriteria] = useState(false);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("id, name, description, created_at, rounds, track")
      .order("created_at", { ascending: false })
      .returns<EventRow[]>();

    if (!error && data) {
      setEvents(
        data.map((e) => ({
          ...e,
          rounds: e.rounds ?? 1,
          track: e.track ?? null,
        })),
      );
    }
  };

  const loadCriteriaForEvent = async (eventId: string) => {
    const { data, error } = await supabase
      .from("scoring_criteria")
      .select("id, event_id, name, max_score, sort_order")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true })
      .returns<ScoringCriterion[]>();
    if (!error && data) {
      setCriteria(data);
      setCriteriaDirty(false);
    } else {
      setCriteria([]);
      setCriteriaDirty(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  useEffect(() => {
    if (selectedEvent) {
      setFormState({
        name: selectedEvent.name,
        description: selectedEvent.description ?? "",
        rounds: selectedEvent.rounds ?? 1,
        track:
          selectedEvent.track === "Track A"
            ? "TRACK_A"
            : selectedEvent.track === "Track B"
              ? "TRACK_B"
              : "NONE",
      });
      void loadCriteriaForEvent(selectedEvent.id);
    } else {
      setFormState({
        name: "",
        description: "",
        rounds: 1,
        track: "NONE",
      });
      setCriteria([]);
      setCriteriaDirty(false);
    }
  }, [selectedEvent]);

  return (
    <AppShell
      title="Events"
      subtitle="View configured competition events"
      variant="admin"
    >
      <div className="space-y-4">
        <Card title="All Events">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-black/60">
              Select an event to edit, or create a new one.
            </p>
            <button
              type="button"
              onClick={() => setSelectedEventId(null)}
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/70 transition hover:bg-neutral-100"
            >
              + New event
            </button>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-black/50">
              No events found. Preconfigured events should appear here.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Rounds</th>
                    <th className="px-4 py-3 text-right">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr
                      key={event.id}
                      className={`cursor-pointer transition hover:bg-neutral-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                      }`}
                      onClick={() => setSelectedEventId(event.id)}
                    >
                      <td className="px-4 py-3 font-medium text-black/80">
                        {event.name}
                      </td>
                      <td className="px-4 py-3 text-black/70">
                        {event.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-black/70">
                        {event.rounds ?? 1}
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

        <Card title={selectedEvent ? "Edit event" : "Create event"}>
          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              setSavingEvent(true);
              const trackValue =
                formState.track === "TRACK_A"
                  ? "Track A"
                  : formState.track === "TRACK_B"
                    ? "Track B"
                    : null;

              if (selectedEvent) {
                await supabase
                  .from("events")
                  .update({
                    name: formState.name.trim(),
                    description: formState.description.trim(),
                    rounds: formState.rounds,
                    track: trackValue,
                  })
                  .eq("id", selectedEvent.id);
              } else {
                const { data } = await supabase
                  .from("events")
                  .insert({
                    name: formState.name.trim(),
                    description: formState.description.trim(),
                    rounds: formState.rounds,
                    track: trackValue,
                  })
                  .select("id")
                  .single<{ id: string }>();
                if (data?.id) {
                  setSelectedEventId(data.id);
                }
              }

              await loadEvents();
              setSavingEvent(false);
            }}
            className="space-y-3"
          >
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
                Description
              </label>
              <textarea
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="h-20 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Rounds
                </label>
                <input
                  type="number"
                  min={1}
                  value={formState.rounds}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      rounds: Number(e.target.value) || 1,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Track
                </label>
                <select
                  value={formState.track}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      track: e.target.value as "NONE" | "TRACK_A" | "TRACK_B",
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                >
                  <option value="NONE">None</option>
                  <option value="TRACK_A">Track A</option>
                  <option value="TRACK_B">Track B</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingEvent}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingEvent
                  ? "Saving..."
                  : selectedEvent
                    ? "Save changes"
                    : "Create event"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Scoring criteria">
          {!selectedEvent ? (
            <p className="text-sm text-black/50">
              Select or create an event to configure its scoring criteria.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-black/60">
                Add, remove, or reorder criteria. Judges will see these when
                scoring this event.
              </p>
              <div className="space-y-2">
                {criteria.length === 0 && (
                  <p className="text-sm text-black/50">
                    No criteria yet. Add your first criterion.
                  </p>
                )}
                <div className="space-y-2">
                  {criteria.map((c, index) => (
                    <div
                      key={c.id}
                      className="flex flex-col gap-2 rounded-lg border border-black/10 bg-white p-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                          Name
                        </label>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const next = [...criteria];
                            next[index] = { ...c, name: e.target.value };
                            setCriteria(next);
                            setCriteriaDirty(true);
                          }}
                          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="w-24 space-y-1.5">
                          <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                            Max
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={c.max_score}
                            onChange={(e) => {
                              const next = [...criteria];
                              next[index] = {
                                ...c,
                                max_score: Number(e.target.value) || 1,
                              };
                              setCriteria(next);
                              setCriteriaDirty(true);
                            }}
                            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (index === 0) return;
                              const next = [...criteria];
                              [next[index - 1], next[index]] = [
                                next[index],
                                next[index - 1],
                              ];
                              setCriteria(
                                next.map((row, i) => ({
                                  ...row,
                                  sort_order: i + 1,
                                })),
                              );
                              setCriteriaDirty(true);
                            }}
                            className="rounded-full border border-black/10 px-2 py-1 text-xs text-black/70 transition hover:bg-neutral-100 disabled:opacity-40"
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index === criteria.length - 1) return;
                              const next = [...criteria];
                              [next[index + 1], next[index]] = [
                                next[index],
                                next[index + 1],
                              ];
                              setCriteria(
                                next.map((row, i) => ({
                                  ...row,
                                  sort_order: i + 1,
                                })),
                              );
                              setCriteriaDirty(true);
                            }}
                            className="rounded-full border border-black/10 px-2 py-1 text-xs text-black/70 transition hover:bg-neutral-100 disabled:opacity-40"
                            disabled={index === criteria.length - 1}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = criteria.filter((x) => x.id !== c.id);
                            setCriteria(
                              next.map((row, i) => ({
                                ...row,
                                sort_order: i + 1,
                              })),
                            );
                            setCriteriaDirty(true);
                          }}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-700 transition hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const newCriterion: ScoringCriterion = {
                      id: `local-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}`,
                      event_id: selectedEvent.id,
                      name: "New criterion",
                      max_score: 10,
                      sort_order: criteria.length + 1,
                    };
                    setCriteria([...criteria, newCriterion]);
                    setCriteriaDirty(true);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/70 transition hover:bg-neutral-100"
                >
                  + Add criterion
                </button>
                <button
                  type="button"
                  disabled={!criteriaDirty || savingCriteria}
                  onClick={async () => {
                    setSavingCriteria(true);
                    const existingIds = new Set(
                      criteria
                        .filter((c) => !c.id.startsWith("local-"))
                        .map((c) => c.id),
                    );

                    // Delete removed criteria
                    const { data: currentRows } = await supabase
                      .from("scoring_criteria")
                      .select("id")
                      .eq("event_id", selectedEvent.id)
                      .returns<{ id: string }[]>();
                    const toDelete =
                      currentRows
                        ?.map((r) => r.id)
                        .filter((id) => !existingIds.has(id)) ?? [];
                    if (toDelete.length > 0) {
                      await supabase
                        .from("scoring_criteria")
                        .delete()
                        .in("id", toDelete);
                    }

                    // Upsert current criteria (skip local- ids so DB generates real ids)
                    const upsertRows = criteria.map((c, index) => ({
                      id: c.id.startsWith("local-") ? undefined : c.id,
                      event_id: selectedEvent.id,
                      name: c.name.trim(),
                      max_score: c.max_score,
                      sort_order: index + 1,
                    }));

                    await supabase
                      .from("scoring_criteria")
                      .upsert(upsertRows)
                      .eq("event_id", selectedEvent.id);

                    await loadCriteriaForEvent(selectedEvent.id);
                    setSavingCriteria(false);
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingCriteria ? "Saving..." : "Save criteria"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
