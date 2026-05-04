import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blockstudio – Créneaux studio disponibles",
  description:
    "Consultez les disponibilités en temps réel et réservez une séance courte à Corbeil-Essonnes ou Savigny-le-Temple.",

  openGraph: {
    title: "Blockstudio – Créneaux studio disponibles",
    description:
      "Consultez les disponibilités en temps réel et réservez une séance courte à Corbeil-Essonnes ou Savigny-le-Temple.",
    url: "https://blockstudio-reservation.vercel.app/",
    siteName: "Blockstudio",
    type: "website",
    images: [
      {
        url: "https://blockstudio-reservation.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blockstudio - Créneaux studio disponibles"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "Blockstudio – Créneaux studio disponibles",
    description:
      "Réservez rapidement une séance studio en fonction des disponibilités en temps réel.",
    images: ["https://blockstudio-reservation.vercel.app/og-image.jpg"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0d"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
