"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function ResultsPage() {
  const supabase = getSupabaseClient();

  const [results, setResults] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setError("Unable to load events.");
      setEvents([]);
    } else {
      const eventsData = (data ?? []) as any[];
      setEvents(eventsData);
      if (!selectedEventId && eventsData.length > 0) {
        const firstEvent = eventsData[0] as any;
        if (firstEvent && firstEvent.id) {
          setSelectedEventId(firstEvent.id);
        }
      }
    }
    setLoadingEvents(false);
  };

  const loadResults = async (eventId: string) => {
    if (!eventId) {
      setResults([]);
      return;
    }
  
    setLoadingResults(true);
    setError(null);
  
    // First get participants for this event
    const { data: participantData, error: pError } = await supabase
      .from("participants")
      .select("id, team_leader_name, college")
      .eq("event_id", eventId);
  
    if (pError) {
      setError("Unable to load results.");
      setLoadingResults(false);
      return;
    }
  
    const participantIds = (participantData ?? []).map((p: any) => p.id);
  
    if (participantIds.length === 0) {
      setResults([]);
      setLoadingResults(false);
      return;
    }
  
    // Then get all scores for those participants
    const { data: scoreData, error: sError } = await supabase
      .from("scores")
      .select("participant_id, total")
      .in("participant_id", participantIds);
  
    if (sError) {
      setError("Unable to load scores.");
      setLoadingResults(false);
      return;
    }
  
    // Group scores by participant and average them
    const grouped: Record<string, number[]> = {};
    (scoreData ?? []).forEach((row: any) => {
      if (!grouped[row.participant_id]) grouped[row.participant_id] = [];
      grouped[row.participant_id].push(row.total);
    });
  
    const leaderboard = (participantData ?? [])
      .filter((p: any) => grouped[p.id])
      .map((p: any) => {
        const scores = grouped[p.id];
        const average = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        return { name: p.team_leader_name, college: p.college, average };
      })
      .sort((a: any, b: any) => b.average - a.average);
  
    setResults(leaderboard);
    setLoadingResults(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadResults(selectedEventId);
    } else {
      setResults([]);
    }
  }, [selectedEventId]);

  return (
    <AppShell
      title="Results"
      subtitle="Leaderboard and final scores"
      variant="admin"
    >
      <Card title="Leaderboard">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
              Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5 sm:w-64"
              disabled={loadingEvents || events.length === 0}
            >
              {events.length === 0 ? (
                <option value="">
                  {loadingEvents ? "Loading events..." : "No events available"}
                </option>
              ) : (
                events.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-3 text-xs text-red-600" aria-live="polite">
            {error}
          </p>
        )}

        {!selectedEventId && !loadingEvents && events.length > 0 && (
          <p className="text-sm text-black/50">
            Select an event to view its leaderboard.
          </p>
        )}

        {selectedEventId && loadingResults && (
          <p className="text-sm text-black/50">Loading leaderboard…</p>
        )}

        {selectedEventId && !loadingResults && results.length === 0 && !error && (
          <p className="text-sm text-black/50">
            No scores available for this event yet. Results will appear here
            once judges finish scoring.
          </p>
        )}

        {selectedEventId && !loadingResults && results.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-xl border border-black/5">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead className="bg-neutral-50">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">College</th>
                  <th className="px-4 py-3 text-right">Average Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-black/80">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 text-black/80">{r.name}</td>
                    <td className="px-4 py-3 text-black/70">{r.college}</td>
                    <td className="px-4 py-3 text-right text-black/80">
                      {r.average.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
