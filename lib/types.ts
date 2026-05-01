export type StudioCity = "Corbeil-Essonnes" | "Savigny-le-Temple";

export type Studio = {
  id: string;
  name: string;
  city: StudioCity;
  hourlyRate: number;
  minDurationHours: 1 | 2;
  calendarId: string;
};

export type BusySlot = {
  start: string;
  end: string;
};

export type Slot = {
  id: string;
  studioId: string;
  studioName: string;
  city: StudioCity;
  start: string;
  end: string;
  dateLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  durationHours: 1 | 2;
  priceTotal: number;
};

export type BookingRequest = {
  slotId: string;
  studioId: string;
  start: string;
  end: string;
  durationHours: 1 | 2;
  priceTotal: number;
  artistName: string;
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
  website?: string;
};

export type ValidationResult =
  | { ok: true; value: BookingRequest }
  | { ok: false; error: string };
