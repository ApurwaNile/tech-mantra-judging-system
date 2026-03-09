"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function AssignmentsPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [judgeId, setJudgeId] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [message, setMessage] = useState("");

  const loadJudges = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "judge");

    if (data) setJudges(data);
  };

  const loadParticipants = async () => {
    const { data } = await supabase.from("participants").select("*");
    if (data) setParticipants(data);
  };

  useEffect(() => {
    loadJudges();
    loadParticipants();
  }, []);

  const createAssignment = async () => {
    const { error } = await supabase.from("judge_assignments").insert({
      judge_id: judgeId,
      participant_id: participantId,
    } as any);

    if (error) {
      console.error(error);
      setMessage("Error assigning judge");
    } else {
      setMessage("Assignment created");
      setJudgeId("");
      setParticipantId("");
    }
  };

  return (
    <AppShell
      title="Judge Assignments"
      subtitle="Control which judges score which participants"
      variant="admin"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <Card title="Create Assignment">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createAssignment();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Judge
              </label>
              <select
                value={judgeId}
                onChange={(e) => setJudgeId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
              >
                <option value="">Select judge</option>
                {judges.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Participant
              </label>
              <select
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
              >
                <option value="">Select participant</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-black/50">
                Each pair represents one scoring assignment.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90"
              >
                Assign judge
              </button>
            </div>

            {message ? (
              <p className="text-xs text-black/70" aria-live="polite">
                {message}
              </p>
            ) : null}
          </form>
        </Card>

        <Card title="Current Judges & Participants">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Judges
              </h3>
              {judges.length === 0 ? (
                <p className="mt-2 text-sm text-black/50">
                  No judges available yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {judges.map((j) => (
                    <li
                      key={j.id}
                      className="rounded-lg border border-black/5 bg-neutral-50 px-3 py-1.5 text-black/80"
                    >
                      {j.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Participants
              </h3>
              {participants.length === 0 ? (
                <p className="mt-2 text-sm text-black/50">
                  No participants available yet.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {participants.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-lg border border-black/5 bg-neutral-50 px-3 py-1.5 text-black/80"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
