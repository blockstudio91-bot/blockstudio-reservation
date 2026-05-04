"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BookingRequest, Slot, StudioCity } from "@/lib/types";

type DurationOption = 1 | 2;
type LocationFilter = StudioCity | "all";

const phoneRegex = /^(0[67][0-9]{8}|[0-9+]{8,15})$/;

const locationOptions: { label: string; value: LocationFilter }[] = [
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
    if (location === "Savigny-le-Temple") {
      setDuration(2);
    }
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

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger les disponibilités.");
        }

        setSlots(data.slots);
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") {
          setError((loadError as Error).message);
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
    setMessage(null);
    setError(null);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot) return;

    if (!phoneRegex.test(form.phone)) {
      setError("Numéro de téléphone invalide. Exemple accepté : 06XXXXXXXX ou +33XXXXXXXXX.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

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
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "La réservation n’a pas pu être créée.");
      }

   setMessage(
  "Votre créneau est bien bloqué. Merci de respecter l’horaire réservé. Maximum 5 personnes par séance. Si vous souhaitez annulé merci de contacter immédiatement par msg le 0615687053"
);

alert("Réservation confirmée. Votre créneau est bien enregistré.");

      setSelectedSlot(null);
      setForm(emptyForm);
      setSlots((current) => current.filter((slot) => slot.id !== selectedSlot.id));
    } catch (reserveError) {
      setError((reserveError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Blockstudio</p>
        <h1>Prochaines disponibilités studio</h1>
        <p className="subtitle">
          Choisissez votre studio, votre durée et bloquez votre créneau en quelques secondes.
        </p>
      </section>

      <section className="rate-strip" aria-label="Tarifs">
        <span>Corbeil-Essonnes : 30€/h</span>
        <span>Savigny-le-Temple : 35€/h - 2h minimum</span>
        <span>5 personnes maximum par séance</span>
      </section>

      <section className="controls" aria-label="Filtres">
        <div>
          <p className="step">1. Lieu</p>
          <div className="segmented">
            {locationOptions.map((option) => (
              <button
                className={location === option.value ? "active" : ""}
                key={option.value}
                onClick={() => setLocation(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="step">2. Durée</p>
          <div className="segmented two">
            {durationOptions.map((option) => (
              <button
                className={duration === option.value ? "active" : ""}
                key={option.label}
                onClick={() => setDuration(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}

      <section className="slots" aria-label="Prochaines disponibilités">
        <div className="section-title">
          <p className="step">3. Créneaux</p>
          <span>
            {loading ? "Chargement" : `${slots.length} disponible${slots.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {loading ? (
          <div className="empty">Recherche des meilleurs créneaux...</div>
        ) : slots.length === 0 ? (
          <div className="empty">Aucun créneau court disponible sur ce filtre.</div>
        ) : (
          <div className="slot-grid">
            {slots.map((slot) => (
              <article className="slot-card" key={slot.id}>
                <div>
                  <h2>{slot.studioName}</h2>
                  <p>{slot.city}</p>
                </div>

                <div className="slot-time">
                  <strong>{slot.dateLabel}</strong>
                  <span>
                    {slot.startTimeLabel} - {slot.endTimeLabel}
                  </span>
                </div>

                <div className="slot-meta">
                  <span>{slot.durationHours}h</span>
                  <strong>{slot.priceTotal}€</strong>
                </div>

                <button className="primary" onClick={() => openForm(slot)} type="button">
                  Bloquer ce créneau
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="full-booking">
        Pour les séances longues, packs spéciaux ou paiement en ligne, utilisez la réservation complète.
      </p>

      {selectedSlot ? (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <form className="booking-form" onSubmit={submitBooking}>
            <div className="form-head">
              <div>
                <p className="eyebrow">Réservation</p>
                <h2 id="booking-title">{selectedSlot.studioName}</h2>
                <span>
                  {selectedSlot.dateLabel}, {selectedSlot.startTimeLabel} -{" "}
                  {selectedSlot.endTimeLabel}
                </span>
                <strong>
                  {selectedSlot.durationHours}h - {selectedSlot.priceTotal}€
                </strong>
              </div>

              <button className="ghost" onClick={() => setSelectedSlot(null)} type="button">
                Fermer
              </button>
            </div>

            <label>
              Nom d’artiste
              <input
                autoComplete="nickname"
                onChange={(event) => setForm({ ...form, artistName: event.target.value })}
                required
                value={form.artistName}
              />
            </label>

            <label>
              Téléphone
              <input
                autoComplete="tel"
                inputMode="tel"
                pattern="^(0[67][0-9]{8}|[0-9+]{8,15})$"
                placeholder="06XXXXXXXX ou +33..."
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
                value={form.phone}
              />
              <small style={{ opacity: 0.6 }}>
                Numéro vérifié automatiquement — toute fausse information entraîne l’annulation du créneau.
              </small>
            </label>

            <label>
              Email
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                type="email"
                value={form.email}
              />
            </label>

            <input
              aria-hidden="true"
              className="honeypot"
              onChange={(event) => setForm({ ...form, website: event.target.value })}
              tabIndex={-1}
              value={form.website}
            />

            <label className="check">
              <input
                checked={form.consent}
                onChange={(event) => setForm({ ...form, consent: event.target.checked })}
                required
                type="checkbox"
              />
              <span>
                Je confirme m’engager à me présenter à ma séance. Je comprends qu’une réservation est
                un engagement et que toute annulation de dernière minute pénalise l’organisation du
                studio. Je reconnais avoir pris connaissance du tarif, de la durée réservée et de la
                limite de 5 personnes maximum par séance.
              </span>
            </label>

            <button className="primary wide" disabled={submitting} type="submit">
              {submitting ? "Vérification..." : `Confirmer - ${selectedSlot.priceTotal}€`}
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
