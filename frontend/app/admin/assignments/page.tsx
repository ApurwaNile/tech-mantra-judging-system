"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type Judge = {
  id: string;
  name: string;
};

type Event = {
  id: string;
  name: string;
};

type Participant = {
  id: string;
  team_leader_name: string;
};

export default function AssignmentsPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<Judge[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [selectedJudgeId, setSelectedJudgeId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    []
  );

  const [loadingJudges, setLoadingJudges] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const loadJudges = async () => {
    setLoadingJudges(true);
    const { data, error } = await supabase
      .from("judges")
      .select("id, name")
      .order("name", { ascending: true });

    if (!error && data) {
      setJudges(data as Judge[]);
    }
    setLoadingJudges(false);
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from("events")
      .select("id, name")
      .order("name", { ascending: true });

    if (!error && data) {
      setEvents(data as Event[]);
    }
    setLoadingEvents(false);
  };

  useEffect(() => {
    loadJudges();
    loadEvents();
  }, []);

  const loadParticipantsAndAssignments = async (
    judgeId: string,
    eventId: string
  ) => {
    if (!judgeId || !eventId) {
      setParticipants([]);
      setSelectedParticipantIds([]);
      return;
    }

    setLoadingParticipants(true);
    setMessage(null);
    setMessageType(null);

    const [{ data: participantsData, error: participantsError }, { data: assignmentsData, error: assignmentsError }] =
      await Promise.all([
        supabase
          .from("participants")
          .select("id, team_leader_name")
          .eq("event_id", eventId),
        supabase
          .from("judge_assignments")
          .select("participant_id")
          .eq("judge_id", judgeId),
      ]);

    if (participantsError || !participantsData) {
      setParticipants([]);
      setSelectedParticipantIds([]);
      setLoadingParticipants(false);
      return;
    }

    const participantsList = participantsData as Participant[];
    setParticipants(participantsList);

    if (assignmentsError || !assignmentsData) {
      setSelectedParticipantIds([]);
      setLoadingParticipants(false);
      return;
    }

    const assignedIds = (assignmentsData as { participant_id: string }[])
      .map((a) => a.participant_id)
      .filter((id) => participantsList.some((p) => p.id === id));

    setSelectedParticipantIds(assignedIds);
    setLoadingParticipants(false);
  };

  useEffect(() => {
    if (selectedJudgeId && selectedEventId) {
      loadParticipantsAndAssignments(selectedJudgeId, selectedEventId);
    } else {
      setParticipants([]);
      setSelectedParticipantIds([]);
    }
  }, [selectedJudgeId, selectedEventId]);

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedJudgeId || !selectedEventId) {
      setMessageType("error");
      setMessage("Select both a judge and an event first.");
      return;
    }

    const participantIdsForEvent = participants.map((p) => p.id);

    setSaving(true);
    setMessage(null);
    setMessageType(null);

    try {
      if (participantIdsForEvent.length > 0) {
        await supabase
          .from("judge_assignments")
          .delete()
          .eq("judge_id", selectedJudgeId)
          .in("participant_id", participantIdsForEvent);
      }

      if (selectedParticipantIds.length > 0) {
        const rows = selectedParticipantIds.map((participantId) => ({
          judge_id: selectedJudgeId,
          participant_id: participantId,
        }));

        const { error: insertError } = await supabase
          .from("judge_assignments")
          .insert(rows as any);

        if (insertError) {
          throw insertError;
        }
      }

      setMessageType("success");
      setMessage("Assignments saved successfully.");
    } catch {
      setMessageType("error");
      setMessage("Failed to save assignments. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canEditAssignments = !!selectedJudgeId && !!selectedEventId;

  return (
    <AppShell
      title="Judge Assignments"
      subtitle="Assign judges to event participants"
      variant="admin"
    >
      <div className="space-y-4">
        <Card title="Select judge and event">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Judge
              </label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                disabled={loadingJudges}
              >
                <option value="">
                  {loadingJudges ? "Loading judges..." : "Select a judge"}
                </option>
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                disabled={loadingEvents}
              >
                <option value="">
                  {loadingEvents ? "Loading events..." : "Select an event"}
                </option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-black/50">
              Choose a judge and event to configure their assignments.
            </p>
            <button
              type="button"
              onClick={handleSaveAssignments}
              disabled={!canEditAssignments || saving}
              className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Assignments"}
            </button>
          </div>

          {message && (
            <p
              className={`mt-2 text-xs ${
                messageType === "success" ? "text-emerald-700" : "text-red-700"
              }`}
              aria-live="polite"
            >
              {message}
            </p>
          )}
        </Card>

        <Card title="Participants for event">
          {!canEditAssignments && (
            <p className="text-sm text-black/50">
              Select both a judge and an event to view participants.
            </p>
          )}

          {canEditAssignments && loadingParticipants && (
            <p className="text-sm text-black/50">Loading participants…</p>
          )}

          {canEditAssignments &&
            !loadingParticipants &&
            participants.length === 0 && (
              <p className="text-sm text-black/50">
                No participants for this event yet.
              </p>
            )}

          {canEditAssignments &&
            !loadingParticipants &&
            participants.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-black/5">
                <table className="min-w-full border-collapse bg-white text-sm">
                  <thead className="bg-neutral-50">
                    <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                      <th className="px-4 py-3 w-10">Assign</th>
                      <th className="px-4 py-3">Team Leader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                        }
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-black/30 text-black focus:ring-black/40"
                            checked={selectedParticipantIds.includes(p.id)}
                            onChange={() => toggleParticipant(p.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-black/80">
                          {p.team_leader_name}
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


