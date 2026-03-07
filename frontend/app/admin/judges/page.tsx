"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

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
    <div style={{ padding: "40px" }}>
      <h1>Add Judge</h1>

      <input
        placeholder="Judge name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <button onClick={createJudge}>Add Judge</button>

      <p>{message}</p>

      <h2>Judges</h2>
      <ul>
        {judges.map((j) => (
          <li key={j.id}>
            {j.name} — {j.email}
          </li>
        ))}
      </ul>
    </div>
  );
}