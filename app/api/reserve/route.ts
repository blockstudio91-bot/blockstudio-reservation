import { NextRequest, NextResponse } from "next/server";
import { reserveSlot } from "@/lib/reservation";
import type { BookingRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const raw = (await request.json()) as BookingRequest;
  const result = await reserveSlot(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, eventId: result.eventId });
}
