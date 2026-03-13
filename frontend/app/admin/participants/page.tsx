"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type EventRow = {
  id: string;
  name: string;
};

type ParticipantRow = {
  id: string;
  team_leader_name: string;
  team_members: string;
  college: string;
  phone: string;
  event_id: string;
};

export default function ParticipantsPage() {
  const supabase = getSupabaseClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    team_leader_name: string;
    team_members: string;
    college: string;
    phone: string;
  }>({
    team_leader_name: "",
    team_members: "",
    college: "",
    phone: "",
  });
  const [creating, setCreating] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    const { data, error } = await supabase
      .from("events")
      .select("id, name")
      .order("name", { ascending: true })
      .returns<EventRow[]>();

    if (error) {
      setError("Unable to load events.");
      setEvents([]);
    } else {
      const eventsData = data ?? [];
      setEvents(eventsData);
      if (!selectedEventId && eventsData.length > 0) {
        setSelectedEventId(eventsData[0].id);
      }
    }
    setLoadingEvents(false);
  };

  const loadParticipants = async (eventId: string) => {
    if (!eventId) {
      setParticipants([]);
      return;
    }

    setLoadingParticipants(true);
    setError(null);

    const { data, error } = await supabase
      .from("participants")
      .select("id, team_leader_name, team_members, college, phone, event_id")
      .eq("event_id", eventId)
      .returns<ParticipantRow[]>();

    if (error) {
      setError("Unable to load participants for this event.");
      setParticipants([]);
      setLoadingParticipants(false);
      return;
    }

    setParticipants(data ?? []);
    setLoadingParticipants(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId);
    } else {
      setParticipants([]);
    }
  }, [selectedEventId]);

  return (
    <AppShell
      title="Participants"
      subtitle="View participants imported from registration forms"
      variant="admin"
    >
      <div className="space-y-4">
        <Card title="Add participant">
          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              if (!selectedEventId) {
                setError("Select an event before adding participants.");
                return;
              }
              setCreating(true);
              setError(null);
              const { data, error: insertError } = await supabase
                .from("participants")
                .insert({
                  team_leader_name: formState.team_leader_name.trim(),
                  team_members: formState.team_members.trim(),
                  college: formState.college.trim(),
                  phone: formState.phone.trim(),
                  event_id: selectedEventId,
                })
                .select(
                  "id, team_leader_name, team_members, college, phone, event_id",
                )
                .single<ParticipantRow>();

              if (insertError || !data) {
                setError("Failed to create participant.");
              } else {
                setFormState({
                  team_leader_name: "",
                  team_members: "",
                  college: "",
                  phone: "",
                });
                // Only append if we are viewing this event
                setParticipants((prev) =>
                  selectedEventId ? [...prev, data] : prev,
                );
              }
              setCreating(false);
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Team leader name
                </label>
                <input
                  type="text"
                  value={formState.team_leader_name}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      team_leader_name: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Team members
                </label>
                <input
                  type="text"
                  value={formState.team_members}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      team_members: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  placeholder="Comma-separated names"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  College
                </label>
                <input
                  type="text"
                  value={formState.college}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      college: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/50">
                Participant will be added to the currently selected event.
              </p>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Saving..." : "Add participant"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Filter by event">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Select event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5 sm:w-80"
                disabled={loadingEvents || events.length === 0}
              >
                {events.length === 0 ? (
                  <option value="">
                    {loadingEvents ? "Loading events..." : "No events available"}
                  </option>
                ) : (
                  events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600" aria-live="polite">
              {error}
            </p>
          )}
        </Card>

        <Card title="Bulk import via CSV">
          <div className="space-y-2">
            <p className="text-xs text-black/60">
              Paste CSV rows with columns:
              <span className="font-semibold">
                {" "}
                team_leader_name, team_members, college, phone
              </span>
              . The selected event will be used for all rows.
            </p>
            <textarea
              className="h-40 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="e.g.&#10;Alice,Alice;Bob;Charlie,ABC College,9876543210"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={async () => {
                  if (!selectedEventId) {
                    setError("Select an event before importing CSV.");
                    return;
                  }
                  const lines = csvText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);
                  if (lines.length === 0) {
                    setCsvMessage("No rows to import.");
                    return;
                  }
                  setCsvImporting(true);
                  setCsvMessage(null);
                  setError(null);

                  const rows: Omit<ParticipantRow, "id">[] = [];
                  for (const line of lines) {
                    const parts = line.split(",").map((p) => p.trim());
                    if (parts.length < 3) continue;
                    const [leader, members = "", college, phone = ""] = parts;
                    if (!leader || !college) continue;
                    rows.push({
                      team_leader_name: leader,
                      team_members: members,
                      college,
                      phone,
                      event_id: selectedEventId,
                    });
                  }

                  if (rows.length === 0) {
                    setCsvMessage("No valid rows found in CSV.");
                    setCsvImporting(false);
                    return;
                  }

                  const { data, error: insertError } = await supabase
                    .from("participants")
                    .insert(rows)
                    .select(
                      "id, team_leader_name, team_members, college, phone, event_id",
                    )
                    .returns<ParticipantRow[]>();

                  if (insertError) {
                    setError("Failed to import CSV.");
                  } else {
                    setCsvMessage(
                      `Imported ${data ? data.length : rows.length} participants.`,
                    );
                    setCsvText("");
                    // Refresh participants for current event
                    if (selectedEventId) {
                      await loadParticipants(selectedEventId);
                    }
                  }
                  setCsvImporting(false);
                }}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={csvImporting}
              >
                {csvImporting ? "Importing..." : "Import CSV rows"}
              </button>
              {csvMessage && (
                <p className="text-xs text-emerald-700" aria-live="polite">
                  {csvMessage}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Participants">
          {selectedEventId && loadingParticipants && (
            <p className="text-sm text-black/50">Loading participants…</p>
          )}

          {selectedEventId && !loadingParticipants && participants.length === 0 && !error && (
            <p className="text-sm text-black/50">
              No participants for this event yet.
            </p>
          )}

          {!selectedEventId && !loadingEvents && events.length > 0 && (
            <p className="text-sm text-black/50">
              Select an event to view its participants.
            </p>
          )}

          {selectedEventId && !loadingParticipants && participants.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Team Leader</th>
                    <th className="px-4 py-3">Team Members</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}
                    >
                      <td className="px-4 py-3 font-medium text-black/80">
                        {p.team_leader_name}
                      </td>
                      <td className="px-4 py-3 text-black/70">
                        {p.team_members || "—"}
                      </td>
                      <td className="px-4 py-3 text-black/70">{p.college}</td>
                      <td className="px-4 py-3 text-black/70">
                        {p.phone || "—"}
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