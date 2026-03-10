"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function JudgesPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<any[]>([]);

  const loadJudges = async () => {
    const { data } = await supabase
      .from("judges")
      .select("id, name, username");

    if (data) setJudges(data);
  };

  useEffect(() => {
    loadJudges();
  }, []);

  return (
    <AppShell
      title="Judges"
      subtitle="View configured judge accounts"
      variant="admin"
    >
      <Card title="All Judges">
        {judges.length === 0 ? (
          <p className="text-sm text-black/50">No judges configured yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/5">
            <table className="min-w-full border-collapse bg-white text-sm">
              <thead className="bg-neutral-50">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                </tr>
              </thead>
              <tbody>
                {judges.map((j, idx) => (
                  <tr
                    key={j.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/40"}
                  >
                    <td className="px-4 py-3 font-medium text-black/80">
                      {j.name}
                    </td>
                    <td className="px-4 py-3 text-black/70">{j.username}</td>
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
