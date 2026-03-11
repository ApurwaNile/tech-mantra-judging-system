"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Search } from "lucide-react";

type MockEvent = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

const MOCK_EVENTS_DATA: MockEvent[] = [
  { id: "e1", name: "Demo Event", description: "This is a demo event", created_at: "2026-03-10T00:00:00Z" },
  { id: "e2", name: "CAD War", description: "—", created_at: "2026-03-10T00:00:00Z" },
  { id: "e3", name: "Bridge Making", description: "—", created_at: "2026-03-10T00:00:00Z" },
  { id: "e4", name: "Hackathon", description: "—", created_at: "2026-03-10T00:00:00Z" },
  { id: "e5", name: "Robo Soccer", description: "—", created_at: "2026-03-10T00:00:00Z" },
  { id: "e6", name: "Poster Presentation", description: "—", created_at: "2026-03-10T00:00:00Z" },
  { id: "e7", name: "Line Follower", description: "—", created_at: "2026-03-10T00:00:00Z" },
];

export default function EventsPage() {
  const supabase = getSupabaseClient();
  const [events, setEvents] = useState<any[]>(MOCK_EVENTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setEvents(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AppShell variant="admin">
      <div className="mb-6 flex flex-col space-y-1">
        <div className="text-sm font-medium text-textSecondary flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span className="text-primaryDark">Events</span>
        </div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Events</h1>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
           <h2 className="text-xl font-bold text-primaryDark">All Events</h2>
           <div className="flex items-center bg-background rounded-full px-3 py-1.5 border border-border">
              <Search size={16} className="text-textSecondary" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none ml-2 text-sm text-textMain w-full sm:w-48 placeholder:text-textSecondary" 
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50">
              <tr className="border-b border-border text-textSecondary">
                <th className="px-4 py-3 font-medium rounded-tl-xl">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Created</th>
              </tr>
            </thead>
            <tbody className="text-textMain font-medium">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border/50 hover:bg-background/50 transition-colors"
                >
                  <td className="px-4 py-4">{event.name}</td>
                  <td className="px-4 py-4 text-textSecondary">{event.description || "—"}</td>
                  <td className="px-4 py-4 text-right text-textSecondary">
                    {event.created_at ? new Date(event.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && (
                 <tr>
                    <td colSpan={3} className="py-8 text-center text-textSecondary italic">No events found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
