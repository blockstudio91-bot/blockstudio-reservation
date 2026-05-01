import type { Studio } from "./types";

export const TIMEZONE = process.env.BLOCKSTUDIO_TIMEZONE || "Europe/Paris";

export const DEMO_MODE =
  process.env.GOOGLE_CALENDAR_DEMO_MODE !== "false" ||
  !process.env.GOOGLE_CLIENT_EMAIL ||
  !process.env.GOOGLE_PRIVATE_KEY;

export const studios: Studio[] = [
  {
    id: "studio-1-corbeil",
    name: "Studio 1",
    city: "Corbeil-Essonnes",
    hourlyRate: 30,
    minDurationHours: 1,
    calendarId: process.env.STUDIO1_CORBEIL_CALENDAR_ID || "studio1_corbeil_calendar_id"
  },
  {
    id: "studio-2-corbeil",
    name: "Studio 2",
    city: "Corbeil-Essonnes",
    hourlyRate: 30,
    minDurationHours: 1,
    calendarId: process.env.STUDIO2_CORBEIL_CALENDAR_ID || "studio2_corbeil_calendar_id"
  },
  {
    id: "studio-3-corbeil",
    name: "Studio 3",
    city: "Corbeil-Essonnes",
    hourlyRate: 30,
    minDurationHours: 1,
    calendarId: process.env.STUDIO3_CORBEIL_CALENDAR_ID || "studio3_corbeil_calendar_id"
  },
  {
    id: "studio-savigny",
    name: "Studio Savigny",
    city: "Savigny-le-Temple",
    hourlyRate: 35,
    minDurationHours: 2,
    calendarId: process.env.STUDIO_SAVIGNY_CALENDAR_ID || "studio_savigny_calendar_id"
  }
];

export function getStudioById(studioId: string) {
  return studios.find((studio) => studio.id === studioId);
}
