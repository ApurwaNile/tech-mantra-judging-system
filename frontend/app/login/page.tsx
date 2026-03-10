"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
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
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Tech Mantra Judging System</h1>
            <p className="mt-1 text-sm text-black/60">
              Admins sign in with email; judges sign in with username.
            </p>
          </div>

          <Card title="Login">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Login as</label>
                <select
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="JUDGE">Judge</option>
                </select>
              </div>

              {role === "ADMIN" ? (
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="judge username"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-xs text-black/60">
                Tip: create users in Supabase Auth (Email/Password) for now. Role
                enforcement is a later step.
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

