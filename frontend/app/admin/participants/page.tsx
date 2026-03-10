"use client";

import { useEffect, useState } from "react";
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