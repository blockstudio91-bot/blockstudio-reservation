import { google } from "googleapis";
import { DEMO_MODE, TIMEZONE } from "./config";
import { addDemoReservation, getDemoBusySlots } from "./demoStore";
import type { BookingRequest, BusySlot, Studio } from "./types";

function getCalendarClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  return google.calendar({ version: "v3", auth });
}

export async function getBusySlots(calendarIds: string[], startDate: Date, endDate: Date) {
  if (DEMO_MODE) {
    return getDemoBusySlots(calendarIds);
  }

  const calendar = getCalendarClient();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone: TIMEZONE,
      items: calendarIds.map((id) => ({ id }))
    }
  });

  const result: Record<string, BusySlot[]> = {};

  for (const calendarId of calendarIds) {
    const busy = response.data.calendars?.[calendarId]?.busy || [];

    result[calendarId] = busy.map((slot) => ({
      start: slot.start || "",
      end: slot.end || ""
    }));
  }

  return result;
}

export async function createGoogleCalendarEvent(studio: Studio, booking: BookingRequest) {
  if (DEMO_MODE) {
    addDemoReservation(studio.calendarId, booking);
    return { id: `demo-${Date.now()}` };
  }

  const calendar = getCalendarClient();

  const response = await calendar.events.insert({
    calendarId: studio.calendarId,
    requestBody: {
      summary: `Blockstudio — ${booking.artistName} (${booking.durationHours}h — Espèces)`,
      description: [
        "RÉSERVATION BLOCKSTUDIO",
        "",
        `Nom d'artiste : ${booking.artistName}`,
        `Téléphone : ${booking.phone}`,
        `Email : ${booking.email}`,
        `Studio : ${studio.name}`,
        `Ville : ${studio.city}`,
        `Durée : ${booking.durationHours}h`,
        `Prix total : ${booking.priceTotal}€`,
        "",
        "Rappel : 5 personnes maximum par séance.",
        "Réservation effectuée via le système Last Minute Blockstudio."
      ].join("\n"),
      start: {
        dateTime: booking.start,
        timeZone: TIMEZONE
      },
      end: {
        dateTime: booking.end,
        timeZone: TIMEZONE
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: "popup",
            minutes: 10
          }
        ]
      }
    }
  });

  return { id: response.data.id };
}
