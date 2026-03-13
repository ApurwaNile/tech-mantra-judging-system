"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type EventRow = {
  id: string;
  name: string;
  rounds: number;
};

type ParticipantRow = {
  id: string;
  event_id: string;
  team_leader_name: string;
  college: string;
};

type ScoreRow = {
  judge_id: string;
  participant_id: string;
  round_number: number;
  total: number;
};

type AssignmentRow = {
  judge_id: string;
  participant_id: string;
  judges: {
    id: string;
    name: string;
  } | null;
};

type EventJudgeSummary = {
  id: string;
  name: string;
  scoredParticipants: number;
};

type EventWithData = {
  event: EventRow;
  participants: ParticipantRow[];
  scoresByParticipantAndRound: Record<
    string,
    Record<number, { average: number; count: number }>
  >;
  judges: EventJudgeSummary[];
};

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [coordinatorName, setCoordinatorName] = useState<string>("");
  const [eventsData, setEventsData] = useState<EventWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundFilterByEvent, setRoundFilterByEvent] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const storedId = localStorage.getItem("coordinatorId") ?? "";
    const storedName = localStorage.getItem("coordinatorName") ?? "";
    if (!storedId) {
      router.push("/coordinator/login");
      return;
    }
    setCoordinatorName(storedName);

    const loadDashboard = async () => {
      setLoading(true);

      const { data: coordRow } = await supabase
        .from("event_coordinators")
        .select("event_ids")
        .eq("id", storedId)
        .single<{ event_ids: string[] | null }>();

      const eventIds = coordRow?.event_ids ?? [];
      if (eventIds.length === 0) {
        setEventsData([]);
        setLoading(false);
        return;
      }

      const [{ data: eventRows }, { data: participantRows }] = await Promise.all(
        [
          supabase
            .from("events")
            .select("id, name, rounds")
            .in("id", eventIds)
            .returns<EventRow[]>(),
          supabase
            .from("participants")
            .select("id, event_id, team_leader_name, college")
            .in("event_id", eventIds)
            .returns<ParticipantRow[]>(),
        ],
      );

      const allParticipants = participantRows ?? [];
      const participantIds = allParticipants.map((p) => p.id);

      const { data: assignmentRows } = await supabase
        .from("judge_assignments")
        .select("judge_id, participant_id, judges(id, name)")
        .in("participant_id", participantIds)
        .returns<AssignmentRow[]>();

      let scoreRows: ScoreRow[] = [];
      if (participantIds.length > 0) {
        const { data: scores } = await supabase
          .from("scores")
          .select("participant_id, round_number, total, judge_id")
          .in("participant_id", participantIds)
          .returns<ScoreRow[]>();
        scoreRows = scores ?? [];
      }

      const groupedByEvent: EventWithData[] = [];
      (eventRows ?? []).forEach((event) => {
        const participantsForEvent = allParticipants.filter(
          (p) => p.event_id === event.id,
        );
        const participantIdsForEvent = new Set(
          participantsForEvent.map((p) => p.id),
        );

        const scoresLookup: EventWithData["scoresByParticipantAndRound"] = {};
        scoreRows
          .filter((s) =>
            participantIdsForEvent.has(s.participant_id),
          )
          .forEach((s) => {
            if (!scoresLookup[s.participant_id]) {
              scoresLookup[s.participant_id] = {};
            }
            const byRound = scoresLookup[s.participant_id];
            const roundKey = s.round_number || 1;
            if (!byRound[roundKey]) {
              byRound[roundKey] = { average: 0, count: 0 };
            }
            const current = byRound[roundKey];
            current.average =
              (current.average * current.count + s.total) /
              (current.count + 1);
            current.count += 1;
          });

        const judgesForEventMap: Record<
          string,
          { id: string; name: string; scoredSet: Set<string> }
        > = {};

        (assignmentRows ?? [])
          .filter((a) => participantIdsForEvent.has(a.participant_id))
          .forEach((a) => {
            const judgeId = a.judge_id;
            const judgeName = a.judges?.name ?? "Judge";
            if (!judgesForEventMap[judgeId]) {
              judgesForEventMap[judgeId] = {
                id: judgeId,
                name: judgeName,
                scoredSet: new Set<string>(),
              };
            }
          });

        scoreRows
          .filter((s) => participantIdsForEvent.has(s.participant_id))
          .forEach((s) => {
            const entry = judgesForEventMap[s.judge_id];
            if (entry) {
              entry.scoredSet.add(s.participant_id);
            }
          });

        const judgesSummaries: EventJudgeSummary[] = Object.values(
          judgesForEventMap,
        ).map((j) => ({
          id: j.id,
          name: j.name,
          scoredParticipants: j.scoredSet.size,
        }));

        groupedByEvent.push({
          event: {
            ...event,
            rounds: event.rounds ?? 1,
          },
          participants: participantsForEvent,
          scoresByParticipantAndRound: scoresLookup,
          judges: judgesSummaries,
        });
      });

      setEventsData(groupedByEvent);
      setLoading(false);
    };

    void loadDashboard();
  }, [router, supabase]);

  return (
    <AppShell
      title="Coordinator Dashboard"
      subtitle={
        coordinatorName
          ? `Welcome, ${coordinatorName}`
          : "View your events and participant scores"
      }
      variant="coordinator"
    >
      {loading ? (
        <p className="text-sm" style={{ color: "#64748b" }}>
          Loading your events…
        </p>
      ) : eventsData.length === 0 ? (
        <p className="text-sm" style={{ color: "#64748b" }}>
          No events assigned to your coordinator account yet.
        </p>
      ) : (
        <div className="space-y-4">
          {eventsData.map(({ event, participants, scoresByParticipantAndRound, judges }) => {
            const roundFilter = roundFilterByEvent[event.id] ?? "all";

            const leaderboard = participants
              .map((p) => {
                const byRound = scoresByParticipantAndRound[p.id] ?? {};
                if (roundFilter === "all") {
                  let total = 0;
                  let count = 0;
                  Object.values(byRound).forEach((summary) => {
                    total += summary.average * summary.count;
                    count += summary.count;
                  });
                  if (!count) return null;
                  return {
                    name: p.team_leader_name,
                    college: p.college,
                    average: total / count,
                  };
                }
                const rn = Number(roundFilter) || 1;
                const summary = byRound[rn];
                if (!summary) return null;
                return {
                  name: p.team_leader_name,
                  college: p.college,
                  average: summary.average,
                };
              })
              .filter(
                (v): v is { name: string; college: string; average: number } =>
                  v !== null,
              )
              .sort((a, b) => b.average - a.average);

            return (
              <Card
                key={event.id}
                title={event.name}
                subtitle={`Rounds configured: ${event.rounds ?? 1}`}
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    Assigned judges and participant scores for this event.
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] uppercase tracking-wide"
                      style={{ color: "#64748b" }}
                    >
                      Leaderboard Round
                    </span>
                    <select
                      className="rounded-full border px-2 py-1 text-xs"
                      style={{
                        background: "rgba(15,23,42,0.9)",
                        borderColor: "rgba(148,163,184,0.5)",
                        color: "#e2e8f0",
                      }}
                      value={roundFilter}
                      onChange={(e) =>
                        setRoundFilterByEvent((prev) => ({
                          ...prev,
                          [event.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="all">All rounds</option>
                      {Array.from({ length: event.rounds ?? 1 }).map(
                        (_, index) => (
                          <option key={index + 1} value={String(index + 1)}>
                            Round {index + 1}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                {judges.length > 0 && (
                  <div className="mb-4">
                    <p
                      className="mb-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#64748b" }}
                    >
                      Judges
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {judges.map((j) => (
                        <span
                          key={j.id}
                          className="rounded-full px-3 py-1 text-xs"
                          style={{
                            background: "rgba(15,23,42,0.9)",
                            border: "1px solid rgba(148,163,184,0.5)",
                            color: "#e2e8f0",
                          }}
                        >
                          {j.name} ·{" "}
                          <span style={{ color: "#a5b4fc" }}>
                            {j.scoredParticipants} scored
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {participants.length === 0 ? (
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    No participants for this event yet.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-black/5">
                      <table className="min-w-full border-collapse bg-transparent text-xs sm:text-sm">
                        <thead>
                          <tr
                            className="text-left text-[10px] font-medium uppercase tracking-wide sm:text-xs"
                            style={{ color: "#64748b" }}
                          >
                            <th className="px-3 py-2 sm:px-4 sm:py-3">
                              Participant
                            </th>
                            <th className="px-3 py-2 sm:px-4 sm:py-3">
                              College
                            </th>
                            {Array.from({ length: event.rounds ?? 1 }).map(
                              (_, index) => (
                                <th
                                  key={index + 1}
                                  className="px-3 py-2 text-right sm:px-4 sm:py-3"
                                >
                                  Round {index + 1}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((p, idx) => (
                            <tr
                              key={p.id}
                              className={
                                idx % 2 === 0
                                  ? "bg-transparent"
                                  : "bg-[rgba(148,163,184,0.04)]"
                              }
                            >
                              <td
                                className="px-3 py-2 font-medium sm:px-4 sm:py-3"
                                style={{ color: "#e2e8f0" }}
                              >
                                {p.team_leader_name}
                              </td>
                              <td
                                className="px-3 py-2 sm:px-4 sm:py-3"
                                style={{ color: "#cbd5e1" }}
                              >
                                {p.college}
                              </td>
                              {Array.from({ length: event.rounds ?? 1 }).map(
                                (_, index) => {
                                  const roundNumber = index + 1;
                                  const summary =
                                    scoresByParticipantAndRound[p.id]?.[
                                      roundNumber
                                    ];
                                  return (
                                    <td
                                      key={roundNumber}
                                      className="px-3 py-2 text-right sm:px-4 sm:py-3"
                                      style={{ color: "#cbd5e1" }}
                                    >
                                      {summary
                                        ? summary.average.toFixed(2)
                                        : "—"}
                                    </td>
                                  );
                                },
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {leaderboard.length > 0 && (
                      <div className="mt-4">
                        <p
                          className="mb-2 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: "#64748b" }}
                        >
                          Leaderboard
                        </p>
                        <div className="overflow-x-auto rounded-xl border border-black/5">
                          <table className="min-w-full border-collapse bg-transparent text-xs sm:text-sm">
                            <thead>
                              <tr
                                className="text-left text-[10px] font-medium uppercase tracking-wide sm:text-xs"
                                style={{ color: "#64748b" }}
                              >
                                <th className="px-3 py-2 sm:px-4 sm:py-3">
                                  Rank
                                </th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3">
                                  Participant
                                </th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3">
                                  College
                                </th>
                                <th className="px-3 py-2 text-right sm:px-4 sm:py-3">
                                  Avg Score
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {leaderboard.map((row, index) => (
                                <tr
                                  key={row.name + index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-transparent"
                                      : "bg-[rgba(148,163,184,0.04)]"
                                  }
                                >
                                  <td
                                    className="px-3 py-2 sm:px-4 sm:py-3"
                                    style={{ color: "#e2e8f0" }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    className="px-3 py-2 sm:px-4 sm:py-3"
                                    style={{ color: "#e2e8f0" }}
                                  >
                                    {row.name}
                                  </td>
                                  <td
                                    className="px-3 py-2 sm:px-4 sm:py-3"
                                    style={{ color: "#cbd5e1" }}
                                  >
                                    {row.college}
                                  </td>
                                  <td
                                    className="px-3 py-2 text-right sm:px-4 sm:py-3"
                                    style={{ color: "#cbd5e1" }}
                                  >
                                    {row.average.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

