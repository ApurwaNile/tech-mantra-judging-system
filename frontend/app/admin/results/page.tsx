"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

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
          scores: []
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
        average: avg.toFixed(2)
      };
    });

    leaderboard.sort((a: any, b: any) => b.average - a.average);

    setResults(leaderboard);
  };

  useEffect(() => {
    loadResults();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Leaderboard</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Participant</th>
            <th>College</th>
            <th>Average Score</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.college}</td>
              <td>{r.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}