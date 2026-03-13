"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell, PasswordInput } from "@/components/AppShell";
import { Card } from "@/components/Card";

type JudgeRow = {
  id: string;
  name: string;
  username: string;
  password?: string;
};

export default function JudgesPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();

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
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition"
                  style={{
                    background: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.5)",
                    color: "#e2e8f0",
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
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
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition"
                  style={{
                    background: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.5)",
                    color: "#e2e8f0",
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>
                  Password
                </label>
                <PasswordInput
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
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
            <p className="text-sm" style={{ color: "#64748b" }}>
              No judges configured yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5">
              <table className="min-w-full border-collapse bg-transparent text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide" style={{ color: "#64748b" }}>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map((j, idx) => (
                    <tr
                      key={j.id}
                      className={idx % 2 === 0 ? "bg-transparent" : "bg-[rgba(148,163,184,0.04)]"}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: "#e2e8f0" }}>
                        {j.name}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#cbd5e1" }}>
                        {j.username}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            // Impersonate judge from admin
                            localStorage.setItem("role", "judge");
                            localStorage.setItem("judgeId", j.id);
                            localStorage.setItem("judgeName", j.name);
                            localStorage.setItem("impersonatingAdmin", "true");
                            localStorage.setItem("adminReturnPath", "/admin/judges");

                            const { data } = await supabase
                              .from("judge_assignments")
                              .select("participants(event_id)")
                              .eq("judge_id", j.id)
                              .limit(1);

                            const firstAssignment = (data ?? [])[0] as
                              | { participants?: { event_id?: string } }
                              | undefined;
                            const eventId = firstAssignment?.participants?.event_id;

                            if (eventId) {
                              router.push(`/judge/participants?eventId=${eventId}`);
                            } else {
                              router.push("/judge");
                            }
                          }}
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            background: "rgba(56,189,248,0.12)",
                            color: "#e0f2fe",
                          }}
                        >
                          View as Judge
                        </button>
                      </td>
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
