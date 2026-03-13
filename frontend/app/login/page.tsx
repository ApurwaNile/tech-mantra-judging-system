"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PasswordInput } from "@/components/AppShell";
import type { UserRole } from "@/types/models";

/**
 * Architecture note:
 * - This is a client component because it calls Supabase Auth in the browser.
 * - Role selection is a placeholder for now; real role enforcement is typically done
 *   via DB/row-level security + claims, and gated server-side routes.
 */

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      if (role === "ADMIN") {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) throw authError;
        if (!data.user) throw new Error("Login failed: no user returned.");

        localStorage.setItem("role", "admin");
        router.push("/admin");
        return;
      }

      // Judge login via `judges` table (no Supabase Auth).
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        throw new Error("Please enter your username.");
      }

      type JudgeRow = {
        id: string;
        username: string;
        password: string;
        name: string;
      };
      
      const { data: judgeRow, error: judgeError } = await supabase
        .from("judges")
        .select("*")
        .eq("username", trimmedUsername)
        .single<JudgeRow>();
        
      if (judgeError || !judgeRow) {
        throw new Error("Invalid username or password.");
      }

      if (judgeRow.password !== password) {
        throw new Error("Invalid username or password.");
      }

      localStorage.setItem("role", "judge");
      localStorage.setItem("judgeId", judgeRow.id);
      localStorage.setItem("judgeName", judgeRow.name);
      router.push("/judge");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#0a0a0f",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body { background: #0a0a0f; color: #cbd5e1; }
      `}</style>
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold" style={{ color: "#f1f5f9" }}>
              Tech Mantra Judging System
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
              Admins sign in with email; judges sign in with username.
            </p>
          </div>

          <Card title="Login">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "#cbd5e1" }}
                >
                  Login as
                </label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{
                    background: "rgba(15,23,42,0.9)",
                    borderColor: "rgba(148,163,184,0.6)",
                    color: "#e2e8f0",
                  }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="JUDGE">Judge</option>
                </select>
              </div>

              {role === "ADMIN" ? (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "#cbd5e1" }}
                  >
                    Email
                  </label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{
                      background: "rgba(15,23,42,0.9)",
                      borderColor: "rgba(148,163,184,0.6)",
                      color: "#e2e8f0",
                    }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              ) : (
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
                    placeholder="judge username"
                    required
                  />
                </div>
              )}

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

              {error ? (
                <div
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "rgba(239,68,68,0.4)",
                    background: "rgba(127,29,29,0.25)",
                    color: "#fecaca",
                  }}
                >
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>

          <button
            type="button"
            onClick={() => router.push("/coordinator/login")}
            className="mt-4 w-full rounded-full border px-4 py-2 text-sm font-medium transition"
            style={{
              borderColor: "rgba(148,163,184,0.5)",
              color: "#cbd5e1",
              background: "transparent",
            }}
          >
            Coordinator Login
          </button>
        </div>
      </div>
    </div>
  );
}

