import { getStudioById, TIMEZONE } from "./config";
import type { BookingRequest } from "./types";

type BrevoEmailPayload = {
  sender: {
    name: string;
    email: string;
  };
  to: {
    email: string;
    name?: string;
  }[];
  replyTo: {
    email: string;
    name: string;
  };
  subject: string;
  textContent: string;
  htmlContent: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function sendBrevoEmail(payload: BrevoEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY manquante dans les variables d’environnement.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Erreur Brevo ${response.status}: ${errorBody}`);
  }
}

export async function sendReservationEmails(booking: BookingRequest) {
  const studio = getStudioById(booking.studioId);

  if (!studio) {
    throw new Error("Studio introuvable pour l’envoi email.");
  }

  const address =
    studio.city === "Corbeil-Essonnes"
      ? "24 rue Notre-Dame, 91100 Corbeil-Essonnes"
      : "21 rue des Sources, 77176 Savigny-le-Temple";

  const studioLabel = `${studio.name} — ${studio.city}`;
  const dateLabel = formatDate(booking.start);
  const timeLabel = `${formatTime(booking.start)} - ${formatTime(booking.end)}`;
  const durationLabel = `${booking.durationHours}h`;
  const priceLabel = `${booking.priceTotal}€`;

  const clientText = `Bonjour ${booking.artistName},

Votre réservation chez Blockstudio est confirmée.

Studio : ${studioLabel}
Adresse : ${address}
Date : ${dateLabel}
Heure : ${timeLabel}
Durée : ${durationLabel}
Tarif : ${priceLabel}

Merci d’arriver à l’heure prévue.
La séance est limitée à 5 personnes maximum.

Une réservation est un engagement. En validant ce créneau, vous confirmez avoir compris le tarif, la durée réservée et les conditions de la séance.

À très vite chez Blockstudio.

Lexos
Blockstudio`;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2>Réservation confirmée</h2>
      <p>Bonjour ${escapeHtml(booking.artistName)},</p>
      <p>Votre réservation chez <strong>Blockstudio</strong> est confirmée.</p>
      <p>
        <strong>Studio :</strong> ${escapeHtml(studioLabel)}<br>
        <strong>Adresse :</strong> ${escapeHtml(address)}<br>
        <strong>Date :</strong> ${escapeHtml(dateLabel)}<br>
        <strong>Heure :</strong> ${escapeHtml(timeLabel)}<br>
        <strong>Durée :</strong> ${escapeHtml(durationLabel)}<br>
        <strong>Tarif :</strong> ${escapeHtml(priceLabel)}
      </p>
      <p>Merci d’arriver à l’heure prévue.</p>
      <p>La séance est limitée à <strong>5 personnes maximum</strong>.</p>
      <p>Une réservation est un engagement. En validant ce créneau, vous confirmez avoir compris le tarif, la durée réservée et les conditions de la séance.</p>
      <p>À très vite chez Blockstudio.</p>
      <p>Lexos<br>Blockstudio</p>
    </div>
  `;

  const internalText = `Nouvelle réservation confirmée.

Nom artiste : ${booking.artistName}
Téléphone : ${booking.phone}
Email : ${booking.email}

Studio : ${studioLabel}
Ville : ${studio.city}
Adresse : ${address}
Date : ${dateLabel}
Heure : ${timeLabel}
Durée : ${durationLabel}
Tarif : ${priceLabel}

Source : Application de réservation rapide`;

  const internalHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2>Nouvelle réservation confirmée</h2>
      <p>
        <strong>Nom artiste :</strong> ${escapeHtml(booking.artistName)}<br>
        <strong>Téléphone :</strong> ${escapeHtml(booking.phone)}<br>
        <strong>Email :</strong> ${escapeHtml(booking.email)}
      </p>
      <p>
        <strong>Studio :</strong> ${escapeHtml(studioLabel)}<br>
        <strong>Ville :</strong> ${escapeHtml(studio.city)}<br>
        <strong>Adresse :</strong> ${escapeHtml(address)}<br>
        <strong>Date :</strong> ${escapeHtml(dateLabel)}<br>
        <strong>Heure :</strong> ${escapeHtml(timeLabel)}<br>
        <strong>Durée :</strong> ${escapeHtml(durationLabel)}<br>
        <strong>Tarif :</strong> ${escapeHtml(priceLabel)}
      </p>
      <p>Source : Application de réservation rapide</p>
    </div>
  `;

  await Promise.all([
    sendBrevoEmail({
      sender: {
        name: "Blockstudio",
        email: "blockstudio91@gmail.com"
      },
      to: [
        {
          email: booking.email,
          name: booking.artistName
        }
      ],
      replyTo: {
        email: "blockstudio91@gmail.com",
        name: "Blockstudio"
      },
      subject: "Confirmation de votre réservation Blockstudio",
      textContent: clientText,
      htmlContent: clientHtml
    }),
    sendBrevoEmail({
      sender: {
        name: "Blockstudio",
        email: "blockstudio91@gmail.com"
      },
      to: [
        {
          email: "blockstudio91@gmail.com",
          name: "Blockstudio"
        }
      ],
      replyTo: {
        email: "blockstudio91@gmail.com",
        name: "Blockstudio"
      },
      subject: `Nouvelle réservation confirmée — ${studio.name}`,
      textContent: internalText,
      htmlContent: internalHtml
    })
  ]);

  return true;
}
