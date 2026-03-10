"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function JudgeParticipantsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [participants, setParticipants] = useState<any[]>([]);
  const [scores, setScores] = useState<
    Record<
      string,
      {
        innovation: string;
        technical: string;
        presentation: string;
        status: "pending" | "submitted";
        saving?: boolean;
        error?: string | null;
      }
    >
  >({});
  const [pageError, setPageError] = useState<string | null>(null);

  const judgeId =
    typeof window !== "undefined"
      ? localStorage.getItem("judgeId") ?? ""
      : "";
      const eventId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("eventId") ?? ""
        : "";
        const loadParticipants = async () => {
          if (!judgeId || !eventId) return;
        
          const { data, error } = await supabase
            .from("judge_assignments")
            .select(`
              participant_id,
              participants (
                id,
                team_leader_name,
                college,
                event_id
              )
            `)
            .eq("judge_id", judgeId);
        
          if (error) {
            setPageError("Unable to load assigned participants.");
          } else {
            const list = (data ?? [])
              .map((a: any) => a.participants)
              .filter((p: any) => p && p.event_id === eventId);
            setParticipants(list);
          }
        };

        useEffect(() => {
          if (!judgeId) {
            router.push("/login");
            return;
          }
          loadParticipants();
        }, [judgeId, eventId, router]);

  const handleFieldChange = (
    participantId: string,
    field: "innovation" | "technical" | "presentation",
    value: string
  ) => {
    setScores((prev) => {
      const existing = prev[participantId] || {
        innovation: "",
        technical: "",
        presentation: "",
        status: "pending" as const,
      };

      return {
        ...prev,
        [participantId]: {
          ...existing,
          [field]: value,
          error: null,
        },
      };
    });
  };

  const submitScore = async (participantId: string) => {
    const current = scores[participantId] || {
      innovation: "",
      technical: "",
      presentation: "",
      status: "pending" as const,
    };

    const innovation = Number(current.innovation);
    const technical = Number(current.technical);
    const presentation = Number(current.presentation);

    const invalid =
      Number.isNaN(innovation) ||
      Number.isNaN(technical) ||
      Number.isNaN(presentation) ||
      innovation < 0 ||
      innovation > 20 ||
      technical < 0 ||
      technical > 40 ||
      presentation < 0 ||
      presentation > 40;

    if (invalid) {
      setScores((prev) => ({
        ...prev,
        [participantId]: {
          ...current,
          error:
            "Please enter valid scores: Innovation 0–20, Technical 0–40, Presentation 0–40.",
        },
      }));
      return;
    }

    const total = innovation + technical + presentation;

    setScores((prev) => ({
      ...prev,
      [participantId]: { ...current, saving: true, error: null },
    }));

    const { error } = await supabase
      .from("scores")
      .upsert(
        {
          judge_id: judgeId,
          participant_id: participantId,
          criteria1: innovation,
          criteria2: technical,
          criteria3: presentation,
          total: total,
        } as any,
        {
          onConflict: "judge_id,participant_id",
        }
      );

    if (error) {
      setScores((prev) => ({
        ...prev,
        [participantId]: {
          ...current,
          saving: false,
          status: "pending",
          error: "Error submitting score. Please try again.",
        },
      }));
    } else {
      setScores((prev) => ({
        ...prev,
        [participantId]: {
          ...current,
          saving: false,
          status: "submitted",
        },
      }));
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Assigned Participants</h1>

      {pageError && (
        <p style={{ marginTop: "8px", color: "#b91c1c", fontSize: "12px" }}>
          {pageError}
        </p>
      )}

      {participants.length === 0 && !pageError && (
        <p>No participants assigned.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0, marginTop: "24px" }}>
        {participants.map((p) => {
          const scoreState = scores[p.id] || {
            innovation: "",
            technical: "",
            presentation: "",
            status: "pending" as const,
          };

          return (
            <li
              key={p.id}
              style={{
                marginBottom: "24px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
              <strong>{p.team_leader_name}</strong> — {p.college}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      marginBottom: "4px",
                    }}
                  >
                    Innovation (0–20)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={scoreState.innovation}
                    onChange={(e) =>
                      handleFieldChange(p.id, "innovation", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      marginBottom: "4px",
                    }}
                  >
                    Technical (0–40)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={scoreState.technical}
                    onChange={(e) =>
                      handleFieldChange(p.id, "technical", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      marginBottom: "4px",
                    }}
                  >
                    Presentation (0–40)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={scoreState.presentation}
                    onChange={(e) =>
                      handleFieldChange(p.id, "presentation", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              </div>

              {scoreState.error && (
                <p style={{ color: "#b91c1c", fontSize: "12px" }}>
                  {scoreState.error}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => submitScore(p.id)}
                  disabled={scoreState.saving}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#000",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: scoreState.saving ? "default" : "pointer",
                    opacity: scoreState.saving ? 0.7 : 1,
                  }}
                >
                  {scoreState.saving ? "Submitting..." : "Submit Score"}
                </button>

                <span
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    backgroundColor:
                      scoreState.status === "submitted"
                        ? "rgba(22,163,74,0.06)"
                        : "rgba(234,179,8,0.06)",
                    color:
                      scoreState.status === "submitted"
                        ? "#15803d"
                        : "#854d0e",
                  }}
                >
                  {scoreState.status === "submitted"
                    ? "Score Submitted"
                    : "Pending"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}