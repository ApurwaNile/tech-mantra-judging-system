"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function EventsPage() {
  const supabase = getSupabaseClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error(error);
    } else {
      setEvents(data);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);
  

  const createEvent = async () => {
    const { error } = await supabase.from("events").insert({
      name: name,
      description: description,
    } as any);

    if (error) {
      setMessage("Error creating event");
      console.error(error);
    } else {
      setMessage("Event created successfully");
      setName("");
      setDescription("");
      loadEvents();
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Event</h1>

      <input
        type="text"
        placeholder="Event name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={createEvent}>Create Event</button>

      <p>{message}</p>

      <h1>Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </div>
  );
}