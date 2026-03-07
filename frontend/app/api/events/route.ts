import { NextResponse } from "next/server";

/**
 * Architecture note:
 * - These `/app/api/*` route handlers are placeholders.
 * - Later they will validate requests, check Supabase Auth, and read/write Supabase tables.
 */

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/events", method: "GET" });
}

export async function POST() {
  return NextResponse.json({ ok: true, route: "/api/events", method: "POST" });
}

