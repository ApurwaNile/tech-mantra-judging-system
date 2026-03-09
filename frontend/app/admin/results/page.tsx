"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function ResultsPage() {
  const supabase = getSupabaseClient();

  const [results, setResults] = useState<any[]>([]);

  const loadResults = async () => {
    const { data, error } = await supabase
      .from("scores")
      .select(`
        total,
        participant_id,
        participants (
          id,
          name,
          college
        )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const grouped: any = {};

    data.forEach((row: any) => {
      const pid = row.participant_id;

      if (!grouped[pid]) {
        grouped[pid] = {
          participant: row.participants,
          scores: [],
        };
      }

      grouped[pid].scores.push(row.total);
    });

    const leaderboard = Object.values(grouped).map((entry: any) => {
      const avg =
        entry.scores.reduce((a: number, b: number) => a + b, 0) /
        entry.scores.length;

      return {
        name: entry.participant.name,
        college: entry.participant.college,
        average: avg.toFixed(2),
      };
    });

    leaderboard.sort((a: any, b: any) => b.average - a.average);

    setResults(leaderboard);
  };

  useEffect(() => {
    loadResults();
  }, []);

  return (
    <AppShell
      title="Results"
      subtitle="Leaderboard and final scores"
      variant="admin"
    >
      <Card title="Leaderboard">
        {results.length === 0 ? (
          <p className="text-sm text-black/50">
            No scores available yet. Results will appear here once judges finish
            scoring.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/5">
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
                      {r.average}
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
