"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { PasswordInput } from "@/components/AppShell";

export default function CoordinatorLoginPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from("event_coordinators")
        .select("id, name, username, password")
        .eq("username", username.trim())
        .single<{
          id: string;
          name: string;
          username: string;
          password: string;
        }>();

      if (queryError || !data) {
        throw new Error("Invalid username or password.");
      }

      if (data.password !== password) {
        throw new Error("Invalid username or password.");
      }

      localStorage.setItem("role", "coordinator");
      localStorage.setItem("coordinatorId", data.id);
      localStorage.setItem("coordinatorName", data.name);
      router.push("/coordinator/dashboard");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to log in. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0f", fontFamily: "'Outfit', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body { background: #0a0a0f; color: #cbd5e1; }
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold" style={{ color: "#f1f5f9" }}>
              Coordinator Portal – Tech Mantra
            </h1>
            <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
              Sign in with your coordinator username and password.
            </p>
          </div>

          <Card title="Coordinator Login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "#cbd5e1" }}
                >
                  Username
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    background: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.6)",
                    color: "#e2e8f0",
                  }}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "#cbd5e1" }}
                >
                  Password
                </label>
                <div className="mt-1">
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="rounded-lg border px-3 py-2 text-xs"
                  style={{
                    borderColor: "rgba(239,68,68,0.4)",
                    background: "rgba(127,29,29,0.25)",
                    color: "#fecaca",
                  }}
                >
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

