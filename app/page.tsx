"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BookingRequest, Slot, StudioCity } from "@/lib/types";

type DurationOption = 1 | 2;
type LocationFilter = StudioCity | "all";

const phoneRegex = /^(0[67][0-9]{8}|[0-9+]{8,15})$/;

const locationOptions = [
  { label: "Corbeil-Essonnes", value: "Corbeil-Essonnes" },
  { label: "Savigny-le-Temple", value: "Savigny-le-Temple" },
  { label: "Tous les studios", value: "all" }
];

const emptyForm = {
  artistName: "",
  phone: "",
  email: "",
  consent: false,
  website: ""
};

export default function HomePage() {
  const [location, setLocation] = useState<LocationFilter>("all");
  const [duration, setDuration] = useState<DurationOption>(2);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const durationOptions = useMemo(() => {
    if (location === "Savigny-le-Temple") {
      return [{ label: "2h - 70€", value: 2 as const }];
    }
    if (location === "Corbeil-Essonnes") {
      return [
        { label: "1h - 30€", value: 1 as const },
        { label: "2h - 60€", value: 2 as const }
      ];
    }
    return [
      { label: "1h - Corbeil uniquement", value: 1 as const },
      { label: "2h - Tous les studios", value: 2 as const }
    ];
  }, [location]);

  useEffect(() => {
    if (location === "Savigny-le-Temple") setDuration(2);
  }, [location]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlots() {
      setLoading(true);
      setError(null);

      try {
        const search = new URLSearchParams({
          location,
          duration: String(duration)
        });

        const response = await fetch(`/api/availability?${search.toString()}`, {
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setSlots(data.slots);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError((e as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
    return () => controller.abort();
  }, [location, duration]);

  function openForm(slot: Slot) {
    setSelectedSlot(slot);
    setForm(emptyForm);
    setError(null);
  }

  async function submitBooking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!phoneRegex.test(form.phone)) {
      setError("Numéro invalide");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: BookingRequest = {
      slotId: selectedSlot.id,
      studioId: selectedSlot.studioId,
      start: selectedSlot.start,
      end: selectedSlot.end,
      durationHours: selectedSlot.durationHours,
      priceTotal: selectedSlot.priceTotal,
      artistName: form.artistName,
      fullName: form.artistName,
      phone: form.phone,
      email: form.email,
      consent: form.consent,
      website: form.website
    };

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setConfirmedSlot(selectedSlot);
      setMessage("ok");

      setSelectedSlot(null);
      setForm(emptyForm);
      setSlots((s) => s.filter((x) => x.id !== selectedSlot.id));

    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell">

      <h1>Disponibilités studio</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        {slots.map((slot) => (
          <div key={slot.id}>
            <p>{slot.studioName}</p>
            <p>{slot.dateLabel} {slot.startTimeLabel}</p>
            <button onClick={() => openForm(slot)}>Réserver</button>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <form onSubmit={submitBooking}>
          <input
            placeholder="Nom d’artiste"
            onChange={(e) => setForm({ ...form, artistName: e.target.value })}
            required
          />

          <input
            placeholder="Téléphone"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <button type="submit">
            {submitting ? "..." : "Confirmer"}
          </button>
        </form>
      )}

      {/* POPUP MOBILE PREMIUM */}
      {message && confirmedSlot && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: "100%",
            background: "#111",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "20px",
            textAlign: "center",
            color: "white"
          }}>
            <h2>Réservation confirmée</h2>

            <p>
              {confirmedSlot.dateLabel}<br />
              {confirmedSlot.startTimeLabel} - {confirmedSlot.endTimeLabel}
            </p>

            <p style={{ fontSize: "13px", opacity: 0.7 }}>
              Présentez-vous à l’heure prévue
            </p>

            <p style={{ color: "#ff6600", fontSize: "13px" }}>
              En cas d’annulation contactez immédiatement le 06 15 68 70 53
            </p>

            <button
              onClick={() => {
                setMessage(null);
                setConfirmedSlot(null);
              }}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "15px",
                background: "#ff6600",
                border: "none",
                color: "white",
                fontWeight: "bold"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
