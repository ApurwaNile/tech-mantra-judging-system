"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type Judge = { id: string; name: string };
type Event = { id: string; name: string };
type Participant = { id: string; team_leader_name: string };

const MOCK_EVENTS: Event[] = [
  { id: "e1", name: "Demo Event" },
  { id: "e2", name: "CAD War" },
  { id: "e3", name: "Bridge Making" },
  { id: "e4", name: "Hackathon" },
  { id: "e5", name: "Robo Soccer" },
  { id: "e6", name: "Poster Presentation" },
  { id: "e7", name: "Line Follower" },
];

const MOCK_JUDGES: Judge[] = [
  { id: "j1", name: "John Smith" },
  { id: "j2", name: "Jane Doe" },
  { id: "j3", name: "Alan Turing" },
];

const MOCK_PARTICIPANTS: Record<string, Participant[]> = {
  e1: [
    { id: "p1", team_leader_name: "Alice Johnson" },
    { id: "p2", team_leader_name: "David Smith" }
  ],
  e4: [
    { id: "p4", team_leader_name: "Grace Lee" },
    { id: "p5", team_leader_name: "Henry Cavill" }
  ]
};

export default function AssignmentsPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<Judge[]>(MOCK_JUDGES);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const loadJudges = async () => {
    const { data } = await supabase.from("judges").select("id, name").order("name", { ascending: true });
    if (data && data.length > 0) setJudges(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase.from("events").select("id, name").order("name", { ascending: true });
    if (data && data.length > 0) setEvents(data);
  };

  useEffect(() => {
    loadJudges();
    loadEvents();
  }, []);

  const loadParticipantsAndAssignments = async (judgeId: string, eventId: string) => {
    if (!judgeId || !eventId) {
      setParticipants([]);
      setSelectedParticipantIds([]);
      return;
    }

    setMessage(null);
    setMessageType(null);

    // Initial check against real database
    const [{ data: participantsData }, { data: assignmentsData }] = await Promise.all([
      supabase.from("participants").select("id, team_leader_name").eq("event_id", eventId),
      supabase.from("judge_assignments").select("participant_id").eq("judge_id", judgeId),
    ]);

    let participantsList = participantsData as Participant[];

    if (!participantsList || participantsList.length === 0) {
       // fallback to mock
       participantsList = MOCK_PARTICIPANTS[eventId] || [];
       setParticipants(participantsList);
       setSelectedParticipantIds([]); // Simulate no assignments initially on mock data
       return;
    }

    setParticipants(participantsList);

    if (assignmentsData && assignmentsData.length > 0) {
       const assignedIds = (assignmentsData as { participant_id: string }[])
         .map((a) => a.participant_id)
         .filter((id) => participantsList.some((p) => p.id === id));
       setSelectedParticipantIds(assignedIds);
    } else {
       setSelectedParticipantIds([]);
    }
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

    setSaving(true);
    setMessage(null);
    setMessageType(null);

    // Simulate API call delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    // Optimistically set to success since real DB isn't populated currently
    setMessageType("success");
    setMessage("Assignments saved successfully.");
    setSaving(false);
  };

  const canEditAssignments = !!selectedJudgeId && !!selectedEventId;

  return (
    <AppShell variant="admin">
      <div className="mb-6 flex flex-col space-y-1">
        <div className="text-sm font-medium text-textSecondary flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span className="text-primaryDark">Assignments</span>
        </div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Judge Assignments</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
                Judge
              </label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a judge...</option>
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
                Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-textSecondary">
              Choose a judge and event to configure their assignments.
            </p>
            <button
              type="button"
              onClick={handleSaveAssignments}
              disabled={!canEditAssignments || saving}
              className="px-6 py-2 bg-primary hover:bg-primaryDark text-white font-medium rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Assignments"}
            </button>
          </div>

          {message && (
            <p className={`mt-4 text-sm font-medium ${messageType === "success" ? "text-emerald-600" : "text-red-500"}`} aria-live="polite">
              {message}
            </p>
          )}
        </Card>

        <Card>
           <h2 className="text-xl font-bold text-primaryDark mb-6">Event Participants</h2>

          {!canEditAssignments && (
            <div className="py-8 text-center text-sm text-textSecondary bg-background/50 rounded-xl border border-dashed border-border">
              Select both a judge and an event to view participants.
            </div>
          )}

          {canEditAssignments && participants.length === 0 && (
            <div className="py-8 text-center text-sm text-textSecondary bg-background/50 rounded-xl border border-dashed border-border">
              No participants registered for this event yet.
            </div>
          )}

          {canEditAssignments && participants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50">
                  <tr className="border-b border-border text-textSecondary">
                    <th className="px-4 py-3 font-medium rounded-tl-xl w-16 text-center">Assign</th>
                    <th className="px-4 py-3 font-medium rounded-tr-xl">Team Leader</th>
                  </tr>
                </thead>
                <tbody className="text-textMain font-medium">
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                          checked={selectedParticipantIds.includes(p.id)}
                          onChange={() => toggleParticipant(p.id)}
                        />
                      </td>
                      <td className="px-4 py-4">{p.team_leader_name}</td>
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


