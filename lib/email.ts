import { getStudioById, TIMEZONE } from "./config";
import type { BookingRequest } from "./types";

const BLOCKSTUDIO_PHONE_DISPLAY = "06 15 68 70 53";
const BLOCKSTUDIO_PHONE_TEL = "+33615687053";
const BLOCKSTUDIO_PHONE_WHATSAPP = "33615687053";

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
  return String(value ?? "")
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

  const cancellationMessage = `Bonjour Blockstudio, je souhaite vous prévenir d’un imprévu concernant ma réservation.

Nom artiste : ${booking.artistName}
Studio : ${studioLabel}
Date : ${dateLabel}
Heure : ${timeLabel}`;

  const whatsappUrl = `https://wa.me/${BLOCKSTUDIO_PHONE_WHATSAPP}?text=${encodeURIComponent(
    cancellationMessage
  )}`;

  const clientText = `Bonjour ${booking.artistName},

Votre réservation chez Blockstudio est bien confirmée.

Votre créneau est maintenant bloqué :

Studio : ${studioLabel}
Adresse : ${address}
Date : ${dateLabel}
Heure : ${timeLabel}
Durée : ${durationLabel}
Tarif prévu : ${priceLabel}

Merci d’arriver à l’heure afin de profiter pleinement de votre séance.

Petit rappel :
La séance est limitée à 5 personnes maximum.
Votre réservation vous engage sur le créneau choisi, la durée et le tarif indiqué.

En cas d’imprévu, merci de nous prévenir le plus rapidement possible :
Téléphone : ${BLOCKSTUDIO_PHONE_DISPLAY}
WhatsApp : ${whatsappUrl}

À très vite au studio.

L’équipe Blockstudio`;

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 580px; margin: 0 auto; padding: 24px;">
      <div style="border-bottom: 3px solid #ff6a00; padding-bottom: 14px; margin-bottom: 22px;">
        <h1 style="font-size: 24px; margin: 0; color: #111111;">Réservation confirmée</h1>
        <p style="margin: 6px 0 0; color: #555555;">Votre créneau Blockstudio est bien bloqué.</p>
      </div>

      <p>Bonjour ${escapeHtml(booking.artistName)},</p>

      <p>
        Votre réservation chez <strong>Blockstudio</strong> est bien confirmée.
      </p>

      <div style="background: #f5f5f5; border-left: 4px solid #ff6a00; padding: 16px 18px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0 0 8px;"><strong>Studio :</strong> ${escapeHtml(studioLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Adresse :</strong> ${escapeHtml(address)}</p>
        <p style="margin: 0 0 8px;"><strong>Date :</strong> ${escapeHtml(dateLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Heure :</strong> ${escapeHtml(timeLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Durée :</strong> ${escapeHtml(durationLabel)}</p>
        <p style="margin: 0;"><strong>Tarif prévu :</strong> ${escapeHtml(priceLabel)}</p>
      </div>

      <p>
        Merci d’arriver à l’heure afin de profiter pleinement de votre séance.
      </p>

      <p>
        Petit rappel : la séance est limitée à <strong>5 personnes maximum</strong>.
        Votre réservation vous engage sur le créneau choisi, la durée et le tarif indiqué.
      </p>

      <div style="background: #111111; color: #ffffff; padding: 18px; border-radius: 10px; margin: 24px 0;">
        <p style="margin: 0 0 12px; font-weight: bold;">
          Un imprévu ?
        </p>
        <p style="margin: 0 0 16px;">
          Merci de nous prévenir le plus rapidement possible afin que l’équipe puisse s’organiser.
        </p>

        <a href="${whatsappUrl}"
           style="display: inline-block; background: #ff6a00; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: bold;">
          Prévenir Blockstudio rapidement
        </a>

        <p style="margin: 14px 0 0; font-size: 14px;">
          Téléphone direct :
          <a href="tel:${BLOCKSTUDIO_PHONE_TEL}" style="color: #ffffff; text-decoration: underline;">
            ${escapeHtml(BLOCKSTUDIO_PHONE_DISPLAY)}
          </a>
        </p>
      </div>

      <p style="margin-top: 24px;">
        À très vite au studio.
      </p>

      <p>
        <strong>L’équipe Blockstudio</strong>
      </p>

      <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #dddddd; font-size: 12px; color: #777777;">
        Cet email confirme votre réservation. Pour toute question, vous pouvez répondre directement à ce message.
      </div>
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
    <div style="font-family: Arial, sans-serif; color: #111111; line-height: 1.6; max-width: 580px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 22px; margin-bottom: 18px;">Nouvelle réservation confirmée</h1>

      <div style="background: #f5f5f5; padding: 16px 18px; border-radius: 10px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px;"><strong>Nom artiste :</strong> ${escapeHtml(booking.artistName)}</p>
        <p style="margin: 0 0 8px;"><strong>Téléphone :</strong> ${escapeHtml(booking.phone)}</p>
        <p style="margin: 0;"><strong>Email :</strong> ${escapeHtml(booking.email)}</p>
      </div>

      <div style="background: #f5f5f5; padding: 16px 18px; border-radius: 10px;">
        <p style="margin: 0 0 8px;"><strong>Studio :</strong> ${escapeHtml(studioLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Ville :</strong> ${escapeHtml(studio.city)}</p>
        <p style="margin: 0 0 8px;"><strong>Adresse :</strong> ${escapeHtml(address)}</p>
        <p style="margin: 0 0 8px;"><strong>Date :</strong> ${escapeHtml(dateLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Heure :</strong> ${escapeHtml(timeLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Durée :</strong> ${escapeHtml(durationLabel)}</p>
        <p style="margin: 0;"><strong>Tarif :</strong> ${escapeHtml(priceLabel)}</p>
      </div>

      <p style="margin-top: 20px;">
        Source : Application de réservation rapide
      </p>
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
      subject: "Réservation confirmée — Blockstudio",
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
