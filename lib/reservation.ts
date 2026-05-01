import { isSlotFree } from "./availability";
import { getStudioById } from "./config";
import { createGoogleCalendarEvent, getBusySlots } from "./googleCalendar";
import type { BookingRequest } from "./types";
import { preventDoubleBooking, recordDailyReservation, validateCustomerForm } from "./validation";

export async function reserveSlot(raw: BookingRequest) {
  const validation = validateCustomerForm(raw);
  if (!validation.ok) {
    return { ok: false as const, status: 400, error: validation.error };
  }

  const booking = validation.value;
  const studio = getStudioById(booking.studioId);
  if (!studio) {
    return { ok: false as const, status: 404, error: "Studio introuvable." };
  }

  const doubleBooking = preventDoubleBooking(booking);
  if (!doubleBooking.ok) {
    return { ok: false as const, status: 409, error: doubleBooking.error };
  }

  const busySlots = await getBusySlots([studio.calendarId], new Date(booking.start), new Date(booking.end));
  const isFree = isSlotFree(booking.start, booking.end, busySlots[studio.calendarId] || []);
  if (!isFree) {
    return {
      ok: false as const,
      status: 409,
      error: "Ce créneau vient d’être pris. Merci d’en choisir un autre."
    };
  }

  const event = await createGoogleCalendarEvent(studio, booking);
  recordDailyReservation(booking);

  return { ok: true as const, eventId: event.id };
}
