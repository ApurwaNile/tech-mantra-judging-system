"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { Search } from "lucide-react";

type EventRow = {
  id: string;
  name: string;
};

type ParticipantRow = {
  id: string;
  team_leader_name: string;
  team_members: string;
  college: string;
  phone: string;
  event_id: string;
};

const MOCK_EVENTS = [
  { id: "e1", name: "Hackathon 1" },
  { id: "e2", name: "Hackathon 2" },
  { id: "e3", name: "Hackathon 3" },
];

const MOCK_PARTICIPANTS = [
  { id: "p1", team_leader_name: "Alice Johnson", team_members: "Bob, Charlie", college: "Engineering Institute", phone: "+1234567890", event_id: "e1" },
  { id: "p2", team_leader_name: "David Smith", team_members: "Eve", college: "Tech University", phone: "+1987654321", event_id: "e1" },
  { id: "p3", team_leader_name: "Grace Lee", team_members: "Henry, Ian", college: "State College", phone: "+1122334455", event_id: "e2" },
];

export default function ParticipantsPage() {
  const supabase = getSupabaseClient();

  const [events, setEvents] = useState<EventRow[]>(MOCK_EVENTS);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("e1");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Load real events if they exist
  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, name")
      .order("name", { ascending: true })
      .returns<EventRow[]>();

    if (data && data.length > 0) {
      setEvents(data);
      if (!selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    }
  };

  // Load real participants if they exist, else mock
  const loadParticipants = async (eventId: string) => {
    setLoadingParticipants(true);

    const { data, error } = await supabase
      .from("participants")
      .select("id, team_leader_name, team_members, college, phone, event_id")
      .eq("event_id", eventId)
      .returns<ParticipantRow[]>();

    if (data && data.length > 0) {
      setParticipants(data);
    } else {
      // Fallback to mock data matching event id
      const mockFiltered = MOCK_PARTICIPANTS.filter(p => p.event_id === eventId);
      setParticipants(mockFiltered);
    }

    setLoadingParticipants(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId);
    }
  }, [selectedEventId]);

  const filteredParticipants = participants.filter(p => 
    p.team_leader_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell variant="admin">
      <div className="mb-6 flex flex-col space-y-1">
        <div className="text-sm font-medium text-textSecondary flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span className="text-primaryDark">Participants</span>
        </div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Participants</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary">
              Filter by Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full sm:w-80 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-primaryDark">Event Participants</h2>
            <div className="flex items-center bg-background rounded-full px-3 py-1.5 border border-border">
                <Search size={16} className="text-textSecondary" />
                <input 
                  type="text" 
                  placeholder="Search participants..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none ml-2 text-sm text-textMain w-full sm:w-64 placeholder:text-textSecondary" 
                />
            </div>
          </div>

          {loadingParticipants ? (
            <div className="py-8 text-center text-sm text-textSecondary">Loading participants...</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="py-8 text-center text-sm text-textSecondary bg-background/50 rounded-xl border border-dashed border-border">
              No participants found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50">
                  <tr className="border-b border-border text-textSecondary">
                    <th className="px-4 py-3 font-medium rounded-tl-xl">Team Leader</th>
                    <th className="px-4 py-3 font-medium">Team Members</th>
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium rounded-tr-xl">Phone</th>
                  </tr>
                </thead>
                <tbody className="text-textMain font-medium">
                  {filteredParticipants.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 hover:bg-background/50 transition-colors"
                    >
                      <td className="px-4 py-4">{p.team_leader_name}</td>
                      <td className="px-4 py-4 text-textSecondary">{p.team_members || "—"}</td>
                      <td className="px-4 py-4">{p.college}</td>
                      <td className="px-4 py-4 text-textSecondary">{p.phone || "—"}</td>
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