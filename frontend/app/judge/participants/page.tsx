"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ScoringCriterion = {
  id: string;
  name: string;
  max_score: number;
  sort_order: number;
};

type ScoreState = {
  values: Record<string, string>; // criterionId -> value
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
  const [eventRounds, setEventRounds] = useState<number>(1);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreState>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatingAdmin, setImpersonatingAdmin] = useState(false);
  const [adminReturnPath, setAdminReturnPath] = useState<string>("/admin/judges");

  useEffect(() => {
    const storedJudgeId = localStorage.getItem("judgeId") ?? "";
    const params = new URLSearchParams(window.location.search);
    const storedEventId = params.get("eventId") ?? "";
    if (!storedJudgeId) {
      router.push("/login");
      return;
    }
    setJudgeId(storedJudgeId);
    setJudgeName(localStorage.getItem("judgeName") ?? "");
    setEventId(storedEventId);
    const isImpersonating = localStorage.getItem("impersonatingAdmin") === "true";
    const returnPath = localStorage.getItem("adminReturnPath") ?? "/admin/judges";
    setImpersonatingAdmin(isImpersonating);
    setAdminReturnPath(returnPath);
  }, []);

  useEffect(() => {
    if (!judgeId || !eventId) return;
    const loadData = async () => {
      setLoading(true);
      setPageError(null);
      const { data: eventData } = await supabase.from("events").select("name, rounds").eq("id", eventId).single<{ name: string; rounds: number | null }>();
      if (eventData) {
        setEventName(eventData.name);
        setEventRounds(eventData.rounds ?? 1);
      }

      const { data: criteriaData } = await supabase
        .from("scoring_criteria")
        .select("id, name, max_score, sort_order")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true })
        .returns<ScoringCriterion[]>();
      console.log("Loaded scoring criteria for event", eventId, criteriaData);
      setCriteria(criteriaData ?? []);
      const { data, error } = await supabase.from("judge_assignments").select(`participant_id, participants ( id, team_leader_name, college, event_id )`).eq("judge_id", judgeId);
      if (error) { setPageError("Unable to load assigned participants."); setLoading(false); return; }
      const list = (data ?? []).map((a: any) => a.participants).filter((p: any) => p && p.event_id === eventId);
      setParticipants(list);
      if (list.length > 0) {
        const ids = list.map((p: any) => p.id);
        const { data: scoreData } = await supabase
          .from("scores")
          .select("participant_id, round_number")
          .eq("judge_id", judgeId)
          .eq("round_number", selectedRound)
          .in("participant_id", ids);
        if (scoreData && scoreData.length > 0) {
          const loaded: Record<string, ScoreState> = {};
          scoreData.forEach((row: any) => {
            loaded[row.participant_id] = {
              values: {},
              status: "submitted",
            };
          });
          setScores(loaded);
        } else {
          setScores({});
        }
      } else {
        setScores({});
      }
      setLoading(false);
    };
    loadData();
  }, [judgeId, eventId, selectedRound, supabase]);

  const handleFieldChange = (participantId: string, criterionId: string, value: string) => {
    setScores((prev) => {
      const existing =
        prev[participantId] || {
          values: {},
          status: "pending" as const,
        };
      return {
        ...prev,
        [participantId]: {
          ...existing,
          values: { ...existing.values, [criterionId]: value },
          error: null,
        },
      };
    });
  };

  const submitScore = async (participantId: string) => {
    const current =
      scores[participantId] || { values: {}, status: "pending" as const };

    let total = 0;
    for (const criterion of criteria) {
      const raw = current.values[criterion.id] ?? "";
      const value = Number(raw);
      if (
        Number.isNaN(value) ||
        value < 0 ||
        value > criterion.max_score
      ) {
        setScores((prev) => ({
          ...prev,
          [participantId]: {
            ...current,
            error: `Please enter valid scores between 0 and ${criterion.max_score} for all criteria.`,
          },
        }));
        return;
      }
      total += value;
    }

    setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: true, error: null } }));
    const { error } = await supabase
      .from("scores")
      .upsert(
        {
          judge_id: judgeId,
          participant_id: participantId,
          round_number: selectedRound,
          total,
        } as any,
        { onConflict: "judge_id,participant_id,round_number" },
      );
    if (error) { setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: false, status: "pending", error: "Error submitting score. Please try again." } })); }
    else { setScores((prev) => ({ ...prev, [participantId]: { ...current, saving: false, status: "submitted" } })); }
  };

  if (loading)
    return (
      <div
        style={{
          padding: "40px",
          background: "#0a0a0f",
          minHeight: "100vh",
          color: "#cbd5e1",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <p>Loading participants...</p>
      </div>
    );

  return (
    <div
      style={{
        padding: "24px 16px 40px",
        background: "#0a0a0f",
        minHeight: "100vh",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() =>
            impersonatingAdmin
              ? router.push(adminReturnPath)
              : router.push("/judge")
          }
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.5)",
            background: "transparent",
            color: "#cbd5e1",
            fontSize: "12px",
            cursor: "pointer",
            marginBottom: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          ← Back
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 600,
            color: "#f1f5f9",
          }}
        >
          {eventName || "Assigned Participants"}
        </h1>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "13px",
            color: "#cbd5e1",
          }}
        >
          Scoring as:{" "}
          <strong style={{ color: "#f1f5f9" }}>{judgeName}</strong>
        </p>
        {eventRounds > 1 && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
              Round:
            </span>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value) || 1)}
              style={{
                fontSize: "12px",
                padding: "4px 8px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.4)",
                color: "#fff",
              }}
            >
              {Array.from({ length: eventRounds }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Round {index + 1}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {pageError && (
        <p style={{ color: "#fecaca", fontSize: "12px" }}>{pageError}</p>
      )}
      {participants.length === 0 && !pageError && (
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          No participants assigned for this event.
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {participants.map((p) => {
          const scoreState =
            scores[p.id] || { values: {}, status: "pending" as const };
          return (
            <li
              key={p.id}
              style={{
                marginBottom: "18px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                <strong style={{ color: "#f1f5f9" }}>
                  {p.team_leader_name}
                </strong>{" "}
                — {p.college}
              </div>
              {criteria.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#fbbf24" }}>
                  No criteria configured – contact admin.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      criteria.length > 2
                        ? "repeat(2, minmax(0, 1fr))"
                        : "repeat(1, minmax(0, 1fr))",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  {criteria.map((criterion) => (
                    <div key={criterion.id}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: 500,
                          marginBottom: "4px",
                          color: "#cbd5e1",
                        }}
                      >
                        {criterion.name} (0-{criterion.max_score})
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={criterion.max_score}
                        value={scoreState.values[criterion.id] ?? ""}
                        onChange={(e) =>
                          handleFieldChange(
                            p.id,
                            criterion.id,
                            e.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: "1px solid rgba(148,163,184,0.5)",
                          background:
                            scoreState.status === "submitted"
                              ? "rgba(22,163,74,0.08)"
                              : "rgba(15,23,42,0.9)",
                          color: "#e2e8f0",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {scoreState.error && (
                <p style={{ color: "#fecaca", fontSize: "12px" }}>
                  {scoreState.error}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => submitScore(p.id)}
                  disabled={scoreState.saving}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#22c55e",
                    color: "#022c22",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: scoreState.saving ? "default" : "pointer",
                    opacity: scoreState.saving ? 0.7 : 1,
                  }}
                >
                  {scoreState.saving
                    ? "Submitting..."
                    : scoreState.status === "submitted"
                    ? "Update Score"
                    : "Submit Score"}
                </button>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.5)",
                    backgroundColor:
                      scoreState.status === "submitted"
                        ? "rgba(22,163,74,0.15)"
                        : "rgba(234,179,8,0.12)",
                    color:
                      scoreState.status === "submitted"
                        ? "#bbf7d0"
                        : "#facc15",
                  }}
                >
                  {scoreState.status === "submitted" ? "Score Submitted" : "Pending"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
