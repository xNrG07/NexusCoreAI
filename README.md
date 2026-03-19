# NEXUS.core – Vercel-ready Starter

Dieses Paket ist für **GitHub + Vercel** vorbereitet.

Enthalten:
- React/Vite-Frontend
- serverseitiger Gemini-Proxy unter `/api/gemini`
- rechtliche Unterseiten in `public/`, damit sie beim Vite-Build sicher mit in `dist/` landen
- Cookiebot-CMP-Platzhalter
- `vercel.json` mit Vite-Build-Settings, Redirects für `/impressum`, `/datenschutz`, `/cookies` und Function-Dauer für Gemini

## Vor dem Deploy ersetzen

### 1) Gemini-Key in Vercel setzen
In **Vercel → Project Settings → Environment Variables**:

- `GEMINI_API_KEY` = dein echter Gemini-Key

Den Key **nicht** ins Frontend eintragen.

### 2) Cookiebot-CMP einrichten
Ersetze überall `REPLACE_WITH_COOKIEBOT_CBID` durch deine echte Cookiebot Domain Group ID:

- `index.html`
- `public/impressum.html`
- `public/datenschutz.html`
- `public/cookies.html`

### 3) AdSense-Code erst nach CMP-Freigabe einsetzen
Im Projekt sind nur Platzhalter enthalten.

## Lokal starten

```bash
npm install
npm run dev
```

## Build-Test

```bash
npm run build
```

## Auf Vercel deployen

1. Projekt auf GitHub pushen
2. In Vercel importieren
3. `GEMINI_API_KEY` in den Environment Variables setzen
4. Deploy starten

Danach sollte Folgendes funktionieren:
- Startseite
- `/api/gemini`
- `/impressum`
- `/datenschutz`
- `/cookies`
