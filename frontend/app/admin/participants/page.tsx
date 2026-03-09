"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function ParticipantsPage() {
  const supabase = getSupabaseClient();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const loadEvents = async () => {
    const { data } = await supabase.from("events").select("*");
    if (data) setEvents(data);
  };

  const loadParticipants = async () => {
    const { data } = await supabase.from("participants").select("*");
    if (data) setParticipants(data);
  };

  useEffect(() => {
    loadEvents();
    loadParticipants();
  }, []);

  const createParticipant = async () => {
    const { error } = await supabase.from("participants").insert({
      name,
      college,
      event_id: eventId,
    } as any);

    if (error) {
      setMessage("Error adding participant");
      console.error(error);
    } else {
      setMessage("Participant added");
      setName("");
      setCollege("");
      setEventId("");
      loadParticipants();
    }
  };

  return (
    <AppShell
      title="Participants"
      subtitle="Register participants and link them to events"
      variant="admin"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <Card title="Add Participant">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createParticipant();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Participant name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                College
              </label>
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="College / organization"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-black/50">
                Make sure the event exists before adding participants.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90"
              >
                Add participant
              </button>
            </div>

            {message ? (
              <p className="text-xs text-black/70" aria-live="polite">
                {message}
              </p>
            ) : null}
          </form>
        </Card>

        <Card title="All Participants">
          {participants.length === 0 ? (
            <p className="text-sm text-black/50">No participants registered yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Event ID</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}
                    >
                      <td className="px-4 py-3 font-medium text-black/80">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-black/70">{p.college}</td>
                      <td className="px-4 py-3 text-xs text-black/50">
                        {p.event_id || "—"}
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

