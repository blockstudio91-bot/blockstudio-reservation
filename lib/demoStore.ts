import type { BookingRequest, BusySlot } from "./types";

type DemoReservation = {
  booking: BookingRequest;
  createdAt: string;
};

const demoReservations: DemoReservation[] = [];

export function getDemoBusySlots(calendarIds: string[]) {
  const busySlotsByCalendar: Record<string, BusySlot[]> = {};
  for (const calendarId of calendarIds) {
    busySlotsByCalendar[calendarId] = seedBusySlots(calendarId);
  }

  for (const reservation of demoReservations) {
    const calendarId = reservation.booking.studioId;
    busySlotsByCalendar[calendarId] = [
      ...(busySlotsByCalendar[calendarId] || []),
      { start: reservation.booking.start, end: reservation.booking.end }
    ];
  }

  return busySlotsByCalendar;
}

export function addDemoReservation(calendarId: string, booking: BookingRequest) {
  demoReservations.push({
    booking: { ...booking, studioId: calendarId },
    createdAt: new Date().toISOString()
  });
}

function seedBusySlots(calendarId: string) {
  const busy: BusySlot[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + dayOffset);

    const baseHour = calendarId.includes("savigny") ? 18 : 16 + (dayOffset % 3);
    const start = new Date(day);
    start.setHours(baseHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(baseHour + 2, 0, 0, 0);
    busy.push({ start: start.toISOString(), end: end.toISOString() });
  }

  return busy;
}
