"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Search } from "lucide-react";

const MOCK_JUDGES = [
  { id: "1", name: "John Smith", username: "judge1" },
  { id: "2", name: "Jane Doe", username: "judge2" },
  { id: "3", name: "Alan Turing", username: "aturing" },
];

export default function JudgesPage() {
  const supabase = getSupabaseClient();

  const [judges, setJudges] = useState<any[]>(MOCK_JUDGES); // Fallback to mock data initially

  const loadJudges = async () => {
    const { data } = await supabase
      .from("judges")
      .select("id, name, username");

    if (data && data.length > 0) {
      setJudges(data);
    }
  };

  useEffect(() => {
    loadJudges();
  }, []);

  return (
    <AppShell
      variant="admin"
    >
      <div className="mb-6 flex flex-col space-y-1">
        <div className="text-sm font-medium text-textSecondary flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span className="text-primaryDark">Judges</span>
        </div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Judges</h1>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
           <h2 className="text-xl font-bold text-primaryDark">All Judges</h2>
           <div className="flex items-center bg-background rounded-full px-3 py-1.5 border border-border">
              <Search size={16} className="text-textSecondary" />
              <input type="text" placeholder="Search judges..." className="bg-transparent border-none outline-none ml-2 text-sm text-textMain w-full sm:w-48 placeholder:text-textSecondary" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50">
              <tr className="border-b border-border text-textSecondary">
                <th className="px-4 py-3 font-medium rounded-tl-xl">Name</th>
                <th className="px-4 py-3 font-medium rounded-tr-xl">Username</th>
              </tr>
            </thead>
            <tbody className="text-textMain font-medium">
              {judges.map((j) => (
                <tr
                  key={j.id}
                  className="border-b border-border/50 hover:bg-background/50 transition-colors"
                >
                  <td className="px-4 py-4">{j.name}</td>
                  <td className="px-4 py-4">{j.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

