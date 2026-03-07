"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

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
    <div style={{ padding: "40px" }}>
      <h1>Assign Judge to Participant</h1>

      <select value={judgeId} onChange={(e) => setJudgeId(e.target.value)}>
        <option value="">Select Judge</option>
        {judges.map((j) => (
          <option key={j.id} value={j.id}>
            {j.name}
          </option>
        ))}
      </select>

      <br /><br />

      <select
        value={participantId}
        onChange={(e) => setParticipantId(e.target.value)}
      >
        <option value="">Select Participant</option>
        {participants.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={createAssignment}>Assign</button>

      <p>{message}</p>
    </div>
  );
}