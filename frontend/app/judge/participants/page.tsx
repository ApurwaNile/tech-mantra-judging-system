"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function JudgeParticipantsPage() {
  const supabase = getSupabaseClient();

  const [participants, setParticipants] = useState<any[]>([]);

  // TEMP: replace with real judge id from Supabase
  const judgeId = "cc7fd76d-b994-4b95-b6f9-b1dd71a80ae1";

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from("judge_assignments")
      .select(`
        participant_id,
        participants (
          id,
          name,
          college
        )
      `)
      .eq("judge_id", judgeId);

    if (error) {
      console.error(error);
    } else {
      const list = data?.map((a: any) => a.participants) || [];
      setParticipants(list);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const submitScore = async (participantId: string) => {
    const score1 = prompt("Innovation score (0-10)");
    const score2 = prompt("Technical score (0-10)");
    const score3 = prompt("Presentation score (0-10)");
  
    const total =
      Number(score1) + Number(score2) + Number(score3);
  
    const { data, error } = await supabase
      .from("scores")
      .upsert(
        {
          judge_id: judgeId,
          participant_id: participantId,
          criteria1: Number(score1),
          criteria2: Number(score2),
          criteria3: Number(score3),
          total: total
        } as any,
        {
          onConflict: "judge_id,participant_id"
        }
      )
      .select();
  
    console.log("Insert result:", data, error);
  
    if (error) {
      alert("Error submitting score");
      console.error(error);
    } else {
      alert("Score submitted");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Assigned Participants</h1>

      {participants.length === 0 && <p>No participants assigned.</p>}

      <ul>
  {participants.map((p) => (
    <li key={p.id} style={{ marginBottom: "20px" }}>
      <strong>{p.name}</strong> — {p.college}

      <br /><br />

      <button onClick={() => submitScore(p.id)}>
        Submit Score
      </button>
    </li>
  ))}
</ul>
    </div>
  );
}