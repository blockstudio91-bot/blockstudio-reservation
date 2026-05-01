import { NextRequest, NextResponse } from "next/server";
import { generateAvailableSlots, filterSlotsByStudioAndCity } from "@/lib/availability";
import { studios } from "@/lib/config";
import { addHours } from "@/lib/date";
import { getBusySlots } from "@/lib/googleCalendar";
import type { StudioCity } from "@/lib/types";

export async function GET(request: NextRequest) {
  const location = (request.nextUrl.searchParams.get("location") || "all") as StudioCity | "all";
  const duration = Number(request.nextUrl.searchParams.get("duration") || 2);

  if (duration !== 1 && duration !== 2) {
    return NextResponse.json({ error: "Durée non disponible." }, { status: 400 });
  }

  if (location === "Savigny-le-Temple" && duration === 1) {
    return NextResponse.json({ slots: [] });
  }

  const now = new Date();
  const end = addHours(now, 24 * 8);
  const calendarIds = studios.map((studio) => studio.calendarId);
  const busySlots = await getBusySlots(calendarIds, now, end);
  const allSlots = generateAvailableSlots(studios, busySlots, duration);
  const slots = filterSlotsByStudioAndCity(allSlots, location, duration);

  return NextResponse.json({ slots });
}
