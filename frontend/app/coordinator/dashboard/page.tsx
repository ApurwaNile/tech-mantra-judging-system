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
  participant_id: string;
  round_number: number;
  total: number;
};

type EventWithData = {
  event: EventRow;
  participants: ParticipantRow[];
  scoresByParticipantAndRound: Record<
    string,
    Record<number, { average: number; count: number }>
  >;
};

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [coordinatorName, setCoordinatorName] = useState<string>("");
  const [eventsData, setEventsData] = useState<EventWithData[]>([]);
  const [loading, setLoading] = useState(true);

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

      let scoreRows: ScoreRow[] = [];
      if (participantIds.length > 0) {
        const { data: scores } = await supabase
          .from("scores")
          .select("participant_id, round_number, total")
          .in("participant_id", participantIds)
          .returns<ScoreRow[]>();
        scoreRows = scores ?? [];
      }

      const groupedByEvent: EventWithData[] = [];
      (eventRows ?? []).forEach((event) => {
        const participantsForEvent = allParticipants.filter(
          (p) => p.event_id === event.id,
        );
        const scoresLookup: EventWithData["scoresByParticipantAndRound"] = {};
        scoreRows
          .filter((s) =>
            participantsForEvent.some((p) => p.id === s.participant_id),
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

        groupedByEvent.push({
          event: {
            ...event,
            rounds: event.rounds ?? 1,
          },
          participants: participantsForEvent,
          scoresByParticipantAndRound: scoresLookup,
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
        <p className="text-sm text-black/50">Loading your events…</p>
      ) : eventsData.length === 0 ? (
        <p className="text-sm text-black/50">
          No events assigned to your coordinator account yet.
        </p>
      ) : (
        <div className="space-y-4">
          {eventsData.map(({ event, participants, scoresByParticipantAndRound }) => (
            <Card key={event.id} title={event.name}>
              {participants.length === 0 ? (
                <p className="text-sm text-black/50">
                  No participants for this event yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-black/5">
                  <table className="min-w-full border-collapse bg-white text-xs sm:text-sm">
                    <thead className="bg-neutral-50">
                      <tr className="text-left text-[10px] font-medium uppercase tracking-wide text-black/50 sm:text-xs">
                        <th className="px-3 py-2 sm:px-4 sm:py-3">Participant</th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3">College</th>
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
                            idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                          }
                        >
                          <td className="px-3 py-2 font-medium text-black/80 sm:px-4 sm:py-3">
                            {p.team_leader_name}
                          </td>
                          <td className="px-3 py-2 text-black/70 sm:px-4 sm:py-3">
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
                                  className="px-3 py-2 text-right text-black/80 sm:px-4 sm:py-3"
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
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

