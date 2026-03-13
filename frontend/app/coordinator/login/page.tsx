"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

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
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">
              Coordinator Portal – Tech Mantra
            </h1>
            <p className="mt-1 text-xs text-black/60">
              Sign in with your coordinator username and password.
            </p>
          </div>

          <Card title="Coordinator Login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
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

