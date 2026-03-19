# NEXUS.core – AdSense/CMP Starter

Dieses Paket ist ein technischer Starter für dein Vite/React-Projekt und enthält:

- sichere Gemini-Anfrage über `/api/gemini` statt offenem Frontend-Key
- echte Unterseiten: `impressum.html`, `datenschutz.html`, `cookies.html`
- Cookiebot-CMP-Platzhalter in allen HTML-Dateien
- Cookie-Erklärungsseite für den späteren Live-Betrieb
- Favicon als SVG

## Was du noch selbst ersetzen musst

### 1) Gemini-Key in Vercel setzen
In Vercel unter **Project Settings → Environment Variables**:

- `GEMINI_API_KEY` = dein echter Gemini-Key

Wichtig: Den Key **nicht** mehr in `src/App.jsx` eintragen.

### 2) Cookiebot-CMP einrichten
Erstelle ein Cookiebot-Konto, füge deine Domain hinzu und kopiere danach deine Domain Group ID.
Ersetze in diesen Dateien überall:

`REPLACE_WITH_COOKIEBOT_CBID`

- `index.html`
- `impressum.html`
- `datenschutz.html`
- `cookies.html`

### 3) AdSense erst nach CMP + Freigabe aktivieren
Im Starter sind nur AdSense-Platzhalter enthalten. Deinen echten AdSense-Code solltest du erst nach fertiger CMP-Konfiguration und Live-Test einbauen.

### 4) Rechtstexte final prüfen
Die Seiten sind auf deinen bisherigen Angaben aufgebaut, aber du solltest vor Livegang prüfen:

- Name / Adresse / E-Mail
- tatsächlicher Website-Zweck
- eingesetzte Anbieter
- final aktive Cookies / Skripte / Dienste

## Lokaler Start

```bash
npm install
npm run dev
```

## Deployment auf Vercel

1. Projekt zu GitHub pushen
2. In Vercel importieren
3. `GEMINI_API_KEY` setzen
4. deployen

