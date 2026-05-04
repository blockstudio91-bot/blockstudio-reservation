import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blockstudio – Studios disponibles maintenant",

  description:
    "Studios libres en temps réel. Réservez immédiatement une séance de 1h ou 2h à Corbeil-Essonnes ou Savigny-le-Temple.",

  openGraph: {
    title: "Studios disponibles maintenant",
    description:
      "Voir les créneaux libres en temps réel et réserver immédiatement une séance de 1h ou 2h.",
    url: "https://blockstudio-reservation.vercel.app/",
    siteName: "Blockstudio",
    type: "website",
    images: [
      {
        url: "https://blockstudio-reservation.vercel.app/og-image.jpg",
        width: 1200,
        height: 1200,
        alt: "Studios disponibles maintenant"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "Studios disponibles maintenant",
    description:
      "Réservez immédiatement une séance studio de 1h ou 2h selon les disponibilités en temps réel.",
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
