import { getStudioById } from "./config";
import type { BookingRequest, ValidationResult } from "./types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const frenchPhoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

const dailyPhones = new Set<string>();
const dailyEmails = new Set<string>();

export function validateCustomerForm(raw: BookingRequest): ValidationResult {
  const booking = {
    ...raw,
    artistName: raw.artistName?.trim(),
    fullName: raw.fullName?.trim(),
    phone: raw.phone?.trim(),
    email: raw.email?.trim().toLowerCase()
  };

  if (booking.website) {
    return { ok: false, error: "Votre demande n’a pas pu être validée." };
  }

  if (!booking.artistName || !booking.fullName || !booking.phone || !booking.email) {
    return { ok: false, error: "Merci de remplir tous les champs obligatoires." };
  }

  if (!booking.consent) {
    return { ok: false, error: "Merci de confirmer votre engagement avant de réserver." };
  }

  if (!emailRegex.test(booking.email)) {
    return { ok: false, error: "Merci d’indiquer une adresse email valide." };
  }

  if (!frenchPhoneRegex.test(booking.phone)) {
    return { ok: false, error: "Merci d’indiquer un téléphone français valide." };
  }

  const studio = getStudioById(booking.studioId);
  if (!studio) {
    return { ok: false, error: "Studio introuvable." };
  }

  if (booking.durationHours !== 1 && booking.durationHours !== 2) {
    return { ok: false, error: "Cette durée n’est pas disponible sur la réservation rapide." };
  }

  if (booking.durationHours < studio.minDurationHours) {
    return { ok: false, error: "Ce studio impose une réservation minimum de 2h." };
  }

  const expectedPrice = studio.hourlyRate * booking.durationHours;
  if (booking.priceTotal !== expectedPrice) {
    return { ok: false, error: "Le tarif envoyé ne correspond pas au créneau." };
  }

  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const expectedEnd = new Date(start.getTime() + booking.durationHours * 60 * 60 * 1000);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end.getTime() !== expectedEnd.getTime() ||
    start <= new Date()
  ) {
    return { ok: false, error: "Ce créneau n’est pas valide." };
  }

  return { ok: true, value: booking };
}

export function preventDoubleBooking(
  booking: BookingRequest
): { ok: true } | { ok: false; error: string } {
  const dayKey = booking.start.slice(0, 10);
  const phoneKey = normalizePhone(booking.phone);
  const emailKey = booking.email.toLowerCase();

  if (dailyPhones.has(`${dayKey}:${phoneKey}`) || dailyEmails.has(`${dayKey}:${emailKey}`)) {
    return {
      ok: false,
      error: "Un même téléphone ou email ne peut pas réserver plus d’un créneau sur la même journée."
    };
  }

  return { ok: true };
}

export function recordDailyReservation(booking: BookingRequest) {
  const dayKey = booking.start.slice(0, 10);
  dailyPhones.add(`${dayKey}:${normalizePhone(booking.phone)}`);
  dailyEmails.add(`${dayKey}:${booking.email.toLowerCase()}`);
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^33/, "0");
}
