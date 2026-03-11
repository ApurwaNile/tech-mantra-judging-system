"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { ChevronDown } from "lucide-react";

type MockEvent = {
  id: string;
  name: string;
  participants: number | string;
  date: string;
  status: "pending" | "live" | "ended";
};

const INITIAL_EVENTS: MockEvent[] = [
  { id: "e1", name: "Demo Event", participants: "12", date: "3/10/2026", status: "pending" },
  { id: "e2", name: "CAD War", participants: "—", date: "3/10/2026", status: "pending" },
  { id: "e3", name: "Bridge Making", participants: "—", date: "3/10/2026", status: "pending" },
  { id: "e4", name: "Hackathon", participants: "—", date: "3/10/2026", status: "pending" },
  { id: "e5", name: "Robo Soccer", participants: "—", date: "3/10/2026", status: "pending" },
  { id: "e6", name: "Poster Presentation", participants: "—", date: "3/10/2026", status: "pending" },
  { id: "e7", name: "Line Follower", participants: "—", date: "3/10/2026", status: "pending" },
];

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<MockEvent[]>(INITIAL_EVENTS);

  const handleStart = (id: string, name: string) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: "live" } : ev));
    alert(`Started event: ${name}`);
  };

  const handleEnd = (id: string, name: string) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, status: "ended" } : ev));
    alert(`Ended event: ${name}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  const handleEdit = (name: string) => {
    alert(`Opening edit settings for ${name}...`);
  };

  return (
    <AppShell variant="admin">
      {/* Breadcrumb / Header */}
      <div className="mb-6 flex flex-col space-y-1">
        <div className="text-sm font-medium text-textSecondary flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-primaryDark">System scores</span>
        </div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin System scores</h1>
      </div>

      {/* Upcoming Events Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primaryDark">Upcoming Events</h2>
          <Link href="/admin/events" className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-primaryDark transition-colors">
            View All <ChevronDown size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-textSecondary">
                <th className="pb-3 font-medium">Hackathon name</th>
                <th className="pb-3 font-medium"># Participants</th>
                <th className="pb-3 font-medium">Date Target</th>
                <th className="pb-3 font-medium flex items-center gap-1">Action</th>
              </tr>
            </thead>
            <tbody className="text-textMain font-medium">
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                  <td className="py-4">{ev.name}</td>
                  <td className="py-4">{ev.participants}</td>
                  <td className="py-4 text-textSecondary">{ev.date}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm">
                      {ev.status === "pending" && (
                        <button onClick={() => handleStart(ev.id, ev.name)} className="text-textSecondary hover:text-primaryDark font-medium underline underline-offset-2 transition-colors">Start</button>
                      )}

                      {ev.status === "live" && (
                        <>
                          <span className="text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full text-xs border border-emerald-100">Live</span>
                          <button onClick={() => handleEnd(ev.id, ev.name)} className="text-textSecondary hover:text-red-600 font-medium underline underline-offset-2 transition-colors">End</button>
                        </>
                      )}

                      {ev.status === "ended" && (
                        <span className="text-textSecondary font-medium px-2 py-1 bg-neutral-100 rounded-full text-xs border border-neutral-200">Completed</span>
                      )}

                      <button onClick={() => handleEdit(ev.name)} className="bg-primary hover:bg-primaryDark text-white px-4 py-1.5 rounded-full text-xs transition-colors ml-2 shadow-sm">Edit</button>
                      <button onClick={() => handleDelete(ev.id, ev.name)} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full text-xs border border-transparent hover:border-red-100 transition-all font-medium ml-1">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-textSecondary italic">No events remaining.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

