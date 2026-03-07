"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function ParticipantsPage() {
  const supabase = getSupabaseClient();

  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const loadEvents = async () => {
    const { data } = await supabase.from("events").select("*");
    if (data) setEvents(data);
  };

  const loadParticipants = async () => {
    const { data } = await supabase.from("participants").select("*");
    if (data) setParticipants(data);
  };

  useEffect(() => {
    loadEvents();
    loadParticipants();
  }, []);

  const createParticipant = async () => {
    const { error } = await supabase.from("participants").insert({
      name,
      college,
      event_id: eventId,
    } as any);

    if (error) {
      setMessage("Error adding participant");
      console.error(error);
    } else {
      setMessage("Participant added");
      setName("");
      setCollege("");
      setEventId("");
      loadParticipants();
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Add Participant</h1>

      <input
        placeholder="Participant name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="College"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />

      <br /><br />

      <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
        <option value="">Select Event</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={createParticipant}>Add Participant</button>

      <p>{message}</p>

      <h2>Participants</h2>
      <ul>
        {participants.map((p) => (
          <li key={p.id}>
            {p.name} — {p.college}
          </li>
        ))}
      </ul>
    </div>
  );
}
