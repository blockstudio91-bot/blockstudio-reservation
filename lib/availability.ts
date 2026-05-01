import { addHours, addMinutes, formatDateLabel, formatTimeLabel, getZonedDateParts, makeZonedDate } from "./date";
import type { BusySlot, Slot, Studio, StudioCity } from "./types";

const OPEN_HOUR = 10;
const CLOSE_HOUR_NEXT_DAY = 6;
const SLOT_STEP_MINUTES = 60;
const DAYS_TO_SHOW = 7;

export function filterSlotsByStudioAndCity(
  slots: Slot[],
  location: StudioCity | "all",
  durationHours: 1 | 2
) {
  return slots
    .filter((slot) => location === "all" || slot.city === location)
    .filter((slot) => slot.durationHours === durationHours)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 30);
}

export function generateAvailableSlots(
  studios: Studio[],
  busySlotsByCalendar: Record<string, BusySlot[]>,
  durationHours: 1 | 2
) {
  const slots: Slot[] = [];
  const now = new Date();
  const today = getZonedDateParts(now);

  for (let dayOffset = 0; dayOffset < DAYS_TO_SHOW; dayOffset += 1) {
    const datePointer = new Date(Date.UTC(today.year, today.month - 1, today.day + dayOffset));
    const year = datePointer.getUTCFullYear();
    const month = datePointer.getUTCMonth() + 1;
    const day = datePointer.getUTCDate();
    const open = makeZonedDate(year, month, day, OPEN_HOUR);
    const close = makeZonedDate(year, month, day + 1, CLOSE_HOUR_NEXT_DAY);

    for (const studio of studios) {
      if (durationHours < studio.minDurationHours) continue;

      const busySlots = busySlotsByCalendar[studio.calendarId] || [];
      for (
        let start = new Date(open);
        addHours(start, durationHours) <= close;
        start = addMinutes(start, SLOT_STEP_MINUTES)
      ) {
        const end = addHours(start, durationHours);
        if (start <= now || overlapsBusySlot(start, end, busySlots)) continue;

        const priceTotal = studio.hourlyRate * durationHours;
        slots.push({
          id: `${studio.id}-${start.toISOString()}-${durationHours}`,
          studioId: studio.id,
          studioName: studio.name,
          city: studio.city,
          start: start.toISOString(),
          end: end.toISOString(),
          dateLabel: formatDateLabel(start),
          startTimeLabel: formatTimeLabel(start),
          endTimeLabel: formatTimeLabel(end),
          durationHours,
          priceTotal
        });
      }
    }
  }

  return slots;
}

export function isSlotFree(startIso: string, endIso: string, busySlots: BusySlot[]) {
  return !overlapsBusySlot(new Date(startIso), new Date(endIso), busySlots);
}

function overlapsBusySlot(start: Date, end: Date, busySlots: BusySlot[]) {
  return busySlots.some((busy) => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    return start < busyEnd && end > busyStart;
  });
}
