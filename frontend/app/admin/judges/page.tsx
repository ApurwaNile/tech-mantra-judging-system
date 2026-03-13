"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";

type JudgeRow = {
  id: string;
  name: string;
  username: string;
  password?: string;
};

export default function JudgesPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<JudgeRow[]>([]);
  const [formState, setFormState] = useState<{
    name: string;
    username: string;
    password: string;
  }>({
    name: "",
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadJudges = async () => {
    const { data } = await supabase
      .from("judges")
      .select("id, name, username")
      .order("name", { ascending: true })
      .returns<JudgeRow[]>();

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
      <div className="space-y-4">
        <Card title="Create judge account">
          <form
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              setSubmitting(true);
              const { error } = await supabase.from("judges").insert({
                name: formState.name.trim(),
                username: formState.username.trim(),
                password: formState.password,
              });
              if (!error) {
                setFormState({ name: "", username: "", password: "" });
                await loadJudges();
              }
              setSubmitting(false);
            }}
            className="space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Username
                </label>
                <input
                  type="text"
                  value={formState.username}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Password
                </label>
                <input
                  type="password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create judge"}
              </button>
            </div>
          </form>
        </Card>

        <Card title="All Judges">
          {judges.length === 0 ? (
            <p className="text-sm text-black/50">No judges configured yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5">
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
      </div>
    </AppShell>
  );
}
