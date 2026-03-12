"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ScoreState = {
  innovation: string;
  technical: string;
  presentation: string;
  status: "pending" | "submitted";
  saving?: boolean;
  error?: string | null;
};

export default function JudgeParticipantsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [judgeId, setJudgeId] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [judgeName, setJudgeName] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreState>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedJudgeId = localStorage.getItem("judgeId") ?? "";
    const params = new URLSearchParams(window.location.search);
    const storedEventId = params.get("eventId") ?? "";
    if (!storedJudgeId) { router.push("/login"); return; }
    setJudgeId(storedJudgeId);
    setJudgeName(localStorage.getItem("judgeName") ?? "");
    setEventId(storedEventId);
  }, []);

  useEffect(() => {
    if (!judgeId || !eventId) return;
    const loadData = async () => {
      setLoading(true);
      setPageError(null);
      const { data: eventData } = await supabase.from("events").select("name").eq("id", eventId).single();
      if (eventData) setEventName((eventData as any).name);
      const { data, error } = await supabase.from("judge_assignments").select(`participant_id, participants ( id, team_leader_name, college, event_id )`).eq("judge_id", judgeId);
      if (error) { setPageError("Unable to load assigned participants."); setLoading(false); return; }
      const list = (data ?? []).map((a: any) => a.participants).filter((p: any) => p && p.event_id === eventId);
      setParticipants(list);
      if (list.length > 0) {
        const ids = list.map((p: any) => p.id);
        const { data: scoreData } = await supabase.from("scores").select("participant_id, criteria1, criteria2, criteria3").eq("judge_id", judgeId).in("participant_id", ids);
        if (scoreData && scoreData.length > 0) {
          const loaded: Record<string, ScoreState> = {};
          scoreData.forEach((row: any) => { loaded[row.participant_id] = { innovation: String(row.criteria1), technical: String(row.criteria2), presentation: String(row.criteria3), status: "submitted" }; });
          setScores(loaded);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [judgeId, eventId]);

  const handleFieldChange = (participantId: string, field: "innovation" | "technical" | "presentation", value: string) => {
    setScores((prev) => {
      const existing = prev[participantId] || { innovation: "", technical: "", presentation: "", status: "pending" as const };
      return { ...prev, [participantId]: { ...existing, [field]: value, error: null } };
    });
  };

  const submitScore = async (participantId: string) => {
    const current = scores[participantId] || { innovation: "", technical: "", presentation: "", status: "pending" as const };
    const innovation = Number(current.innovation);
    const technical = Number(current.technical);
    const presentation = Number(current.presentation);
    const invalid = Number.isNaN(innovation) || Number.isNaN(technical) || Number.isNaN(presentation) || innovation < 0 || innovation > 20 || technical < 0 || technical > 40 || presentation < 0 || presentation > 40;
    if (invalid) { setScores((prev) => ({ ...prev, [participantId]: { ...current, error: "Please enter valid scores: Innovation 0-20, Technical 0-40, Presentation 0-40." } })); return; }
    const total = innovation + technical + presentation;
    setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: true, error: null } }));
    const { error } = await supabase.from("scores").upsert({ judge_id: judgeId, participant_id: participantId, criteria1: innovation, criteria2: technical, criteria3: presentation, total } as any, { onConflict: "judge_id,participant_id" });
    if (error) { setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: false, status: "pending", error: "Error submitting score. Please try again." } })); }
    else { setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: false, status: "submitted" } })); }
  };

  if (loading) return <div style={{ padding: "40px", background: "#000", minHeight: "100vh" }}><p style={{ color: "#fff" }}>Loading participants...</p></div>;

  return (
    <div style={{ padding: "40px", background: "#000", minHeight: "100vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <button onClick={() => router.push("/judge")} style={{ padding: "6px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: "12px", cursor: "pointer", marginBottom: "12px", display: "block" }}>← Back</button>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#fff" }}>{eventName || "Assigned Participants"}</h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Scoring as: <strong style={{ color: "#fff" }}>{judgeName}</strong></p>
      </div>
      {pageError && <p style={{ color: "#f87171", fontSize: "12px" }}>{pageError}</p>}
      {participants.length === 0 && !pageError && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>No participants assigned for this event.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {participants.map((p) => {
          const scoreState = scores[p.id] || { innovation: "", technical: "", presentation: "", status: "pending" as const };
          return (
            <li key={p.id} style={{ marginBottom: "24px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", background: "#fff" }}>
              <div style={{ marginBottom: "12px" }}><strong>{p.team_leader_name}</strong> — {p.college}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginBottom: "12px" }}>
                {(["innovation", "technical", "presentation"] as const).map((field) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}>{field === "innovation" ? "Innovation (0-20)" : field === "technical" ? "Technical (0-40)" : "Presentation (0-40)"}</label>
                    <input type="number" min={0} max={field === "innovation" ? 20 : 40} value={scoreState[field]} onChange={(e) => handleFieldChange(p.id, field, e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", background: scoreState.status === "submitted" ? "rgba(22,163,74,0.04)" : "#fff" }} />
                  </div>
                ))}
              </div>
              {scoreState.error && <p style={{ color: "#b91c1c", fontSize: "12px" }}>{scoreState.error}</p>}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <button onClick={() => submitScore(p.id)} disabled={scoreState.saving} style={{ padding: "6px 14px", borderRadius: "999px", border: "none", backgroundColor: "#000", color: "#fff", fontSize: "12px", fontWeight: 500, cursor: scoreState.saving ? "default" : "pointer", opacity: scoreState.saving ? 0.7 : 1 }}>{scoreState.saving ? "Submitting..." : scoreState.status === "submitted" ? "Update Score" : "Submit Score"}</button>
                <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "999px", border: "1px solid rgba(0,0,0,0.1)", backgroundColor: scoreState.status === "submitted" ? "rgba(22,163,74,0.06)" : "rgba(234,179,8,0.06)", color: scoreState.status === "submitted" ? "#15803d" : "#854d0e" }}>{scoreState.status === "submitted" ? "Score Submitted" : "Pending"}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
