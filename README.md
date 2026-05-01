# Blockstudio - Réservation rapide

Application web mobile-first pour tester un tunnel court de réservation Blockstudio sur des créneaux de 1h et 2h.

La V1 ne remplace pas SimplyBook, ne gère pas les packs longs et ne prend aucun paiement en ligne.

## Fonctionnalités

- Affichage des disponibilités sur les 7 prochains jours.
- 4 studios configurés : Studio 1, Studio 2, Studio 3 à Corbeil-Essonnes, Studio Savigny à Savigny-le-Temple.
- Règles tarifaires :
  - Corbeil-Essonnes : 30€/h, durées 1h ou 2h.
  - Savigny-le-Temple : 35€/h, durée 2h uniquement.
- Horaires d’ouverture : 10h00 à 06h00 le lendemain.
- Dates explicites pour les créneaux après minuit.
- Formulaire client avec validation email, validation téléphone français, case d’engagement obligatoire et honeypot anti-spam.
- Re-vérification du créneau juste avant création de l’événement.
- Mode démo fonctionnel sans Google Calendar.

## Installation

```bash
npm install
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:3000
```

## Variables d’environnement

Copier `.env.example` vers `.env.local`, puis compléter les valeurs.

```bash
cp .env.example .env.local
```

Par défaut, l’application fonctionne en mode démo :

```env
GOOGLE_CALENDAR_DEMO_MODE=true
```

Pour utiliser Google Calendar en réel :

```env
GOOGLE_CALENDAR_DEMO_MODE=false
BLOCKSTUDIO_TIMEZONE=Europe/Paris
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
STUDIO1_CORBEIL_CALENDAR_ID=...
STUDIO2_CORBEIL_CALENDAR_ID=...
STUDIO3_CORBEIL_CALENDAR_ID=...
STUDIO_SAVIGNY_CALENDAR_ID=...
```

Les clés Google restent uniquement côté serveur. Rien n’est exposé au navigateur.

## Connexion des 4 calendriers Google

1. Créer un projet dans Google Cloud.
2. Activer Google Calendar API.
3. Créer un compte de service.
4. Générer une clé privée JSON pour ce compte de service.
5. Récupérer `client_email` et `private_key` depuis le JSON.
6. Créer un calendrier Google par studio :
   - `studio1_corbeil_calendar_id`
   - `studio2_corbeil_calendar_id`
   - `studio3_corbeil_calendar_id`
   - `studio_savigny_calendar_id`
7. Partager chaque calendrier avec l’email du compte de service, avec le droit “Apporter des modifications aux événements”.
8. Coller les vrais calendar IDs dans `.env.local`.

L’application utilise :

- FreeBusy API pour lire les périodes occupées.
- Events API pour créer l’événement de réservation.

## Intégration Wix

Option simple : publier l’application sur un hébergeur Next.js comme Vercel, puis ajouter un bouton Wix vers l’URL externe.

Option iframe : dans Wix, ajouter un bloc “Embed HTML” et insérer :

```html
<iframe
  src="https://votre-domaine-reservation.com"
  style="width:100%;height:900px;border:0;background:#0b0b0d;"
  title="Réservation rapide Blockstudio"
></iframe>
```

Sur mobile, prévoir une hauteur suffisante ou une page Wix dédiée avec seulement l’iframe.

## Fichiers principaux

- `app/page.tsx` : interface client.
- `app/api/availability/route.ts` : lecture des créneaux disponibles.
- `app/api/reserve/route.ts` : validation, anti-abus, re-vérification et création de réservation.
- `lib/config.ts` : configuration studios et calendriers.
- `lib/availability.ts` : génération et filtrage des créneaux.
- `lib/googleCalendar.ts` : FreeBusy API et Events API côté serveur.
- `lib/reservation.ts` : orchestration `reserveSlot()`.
- `lib/validation.ts` : validation formulaire et limite téléphone/email par jour.

## Notes V1

La limite “un téléphone ou email par jour” est gardée en mémoire côté serveur pour cette V1. Pour une production très exposée ou multi-instances, ajouter une petite base de données partagée pour rendre cette limite persistante entre redémarrages.
