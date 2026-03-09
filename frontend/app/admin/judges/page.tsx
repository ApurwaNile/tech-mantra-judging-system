"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

export default function JudgesPage() {
  const supabase = getSupabaseClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [judges, setJudges] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const loadJudges = async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "judge");

    if (data) setJudges(data);
  };

  useEffect(() => {
    loadJudges();
  }, []);

  const createJudge = async () => {
    const { error } = await supabase.from("users").insert({
      name,
      email,
      role: "judge",
    } as any);

    if (error) {
      console.error(error);
      setMessage("Error creating judge");
    } else {
      setMessage("Judge created");
      setName("");
      setEmail("");
      loadJudges();
    }
  };

  return (
    <AppShell
      title="Judges"
      subtitle="Create and manage judge accounts"
      variant="admin"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <Card title="Add Judge">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createJudge();
            }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Judge name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="Full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/80">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-black/50">
                Judges will use this email to log in.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90"
              >
                Add judge
              </button>
            </div>

            {message ? (
              <p className="text-xs text-black/70" aria-live="polite">
                {message}
              </p>
            ) : null}
          </form>
        </Card>

        <Card title="All Judges">
          {judges.length === 0 ? (
            <p className="text-sm text-black/50">No judges created yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-white text-sm">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-black/50">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
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
                      <td className="px-4 py-3 text-black/70">{j.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
