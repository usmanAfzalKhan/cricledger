# CricLedger

**Download (Android APK):**
👉 Latest release: [https://github.com/usmanAfzalKhan/cricledger/releases/latest](https://github.com/usmanAfzalKhan/cricledger/releases/latest)

CricLedger is a clean, fast cricket scoring app I built for quick matches with friends. It guides you from setup → lineups → toss → live scoring → auto summary + graphs. No logins, no ads, and all data stays on your device.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Building an APK (EAS)](#building-an-apk-eas)
* [Releases on GitHub](#releases-on-github)
* [Privacy](#privacy)
* [Troubleshooting](#troubleshooting)
* [Roadmap / Ideas](#roadmap--ideas)

---

## Features

* **Guided match flow**

  * **Setup:** team names, overs cap, optional team logos
  * **Players:** enter squads, mark captains, move players between teams
  * **Toss:** choose toss winner & decision
  * **Lineups:** confirm before scoring

* **Scoring that’s actually fast**

  * One-tap **Run Pad** for 0–7, **extras**, **wickets**, **undo**
  * **Over progress** pips for visual feedback
  * Clean scoreboard and running totals

* **Auto summary**

  * Full batting & bowling tables for both innings
  * Summary header (runs/wkts/overs)
  * **Share as PDF** (pretty, with team logos) or aligned **TXT**
    (uses `expo-print`, `expo-file-system`, `expo-sharing`)

* **Performance graphs**

  * Cumulative **Run Rate**
  * Cumulative **Strike Rate**
  * Over-by-over **Economy**
  * Optional toggle to keep UI simple

* **Smart restart**

  * “Restart Match” jumps back to toss/setup **with the same teams/captains/logos/overs prefilled** so I can tweak and go again

* **No nonsense**

  * No ads, no accounts, no tracking
  * Works fully offline (sharing uses the device share sheet)

---

## Tech Stack

* **Framework:** React Native (Expo SDK 54), TypeScript
* **Routing:** `expo-router`
* **Native modules:** `expo-image-picker`, `expo-print`, `expo-sharing`, `expo-file-system`
* **Build:** EAS Build (Android APKs)
* **UI:** custom styles, simple chart components (no heavy chart libs)

---

## Project Structure

```
app/
  _layout.tsx
  index.tsx              # Home (Start Match, Etiquette, footer About link)
  ethics.tsx             # Cricket Etiquette page
  about.tsx              # About page (app blurb)
  match/
    setup.tsx            # Team names, overs cap, logos
    players.tsx          # Rosters, captains, move/delete/add players
    toss.tsx             # Toss winner + decision
    lineups.tsx          # Confirm elevens
    scoring.tsx          # Live scoring + run pad + over pips
    summary.tsx          # Full scorecard, share PDF/TXT, restart
    graphs.tsx           # RR/SR/Economy charts
components/
  LogoMark.tsx
  RunPad.tsx
  OverProgress.tsx
  SelectModal.tsx
  ... (small UI helpers)
context/
  MatchContext.tsx       # Shared match state where needed
assets/
  bg/stadium.png
  images/icon.png
  images/adaptive-foreground.png
  ...
eas.json                 # EAS profiles (development/preview/production)
app.json                 # Expo app config (icons, Android package, etc.)
package.json
```

---

## Getting Started

**Requirements**

* Node 20 (I’m using `20.19.x`)
* npm
* Expo CLI (via `npx expo ...`)

**Install & run**

```bash
git clone https://github.com/usmanAfzalKhan/cricledger.git
cd cricledger
npm install

# Dev server (open in Expo Go or an emulator)
npx expo start
# If your network blocks tunnels:
# npx expo start --lan
```

---

## Building an APK (EAS)

I use EAS to generate installable APKs.

1. (First time) Configure EAS:

   ```bash
   npx eas build:configure
   # Choose Android
   ```

2. **Preview APK** build (internal distribution):

   ```bash
   npx --yes eas-cli@latest build -p android --profile preview
   ```

   This uploads and builds on Expo’s servers. You’ll get a link like:

   ```
   https://expo.dev/accounts/<account>/projects/cricledger/builds/<build-id>
   ```

   Open it and download the APK artifact.

3. **Versioning**

   * App version lives in `app.json` under `"expo.version"`.
   * I typically bump:

     ```json
     {
       "expo": {
         "version": "1.0.1"
       }
     }
     ```
   * For production tracks, manage version codes with EAS (“remote” versioning). For preview builds it’s fine to just bump app version.

> Tip: If icons change, rebuild (Android caches launcher icons per install).

---

## Releases on GitHub

How I publish for friends/clients to download:

1. Build an APK with EAS (see above).
2. Rename it to something friendly, e.g. `cricledger-1.0.1.apk`.
3. Create a **GitHub Release**:

   * Go to **Releases** → **Draft a new release**
   * Tag: `v1.0.1` (or whatever version)
   * Title: `CricLedger 1.0.1`
   * Attach the APK as a binary asset
   * Publish
4. Share the Releases page or direct APK link.

**Releases page:**
[https://github.com/usmanAfzalKhan/cricledger/releases/latest](https://github.com/usmanAfzalKhan/cricledger/releases/latest)

---

## Privacy

* No analytics, no trackers, no ads.
* Everything is local to the device.
* Sharing a summary (PDF/TXT) uses the system share sheet.

---

## Troubleshooting

* **Expo tunnel error** (`ngrok` took too long):

  * Use `npx expo start --lan` and connect on the same Wi-Fi.

* **“Cannot find native module 'ExponentImagePicker' / 'ExpoPrint'”** in dev:

  * Make sure these are installed (they are in `package.json`).
  * If you edited dependencies, do a clean install:

    ```
    rm -rf node_modules
    npm install
    ```
  * In Expo Go, only *managed* API modules work. For bare/prebuild native changes you need a dev client build, but this project sticks to managed-friendly modules.

* **Icons didn’t update on device:**

  * Uninstall the previous APK from the phone, then install the new one (launcher icons are cached per package).

---

## Roadmap / Ideas

* Per-player advanced stats (fours/sixes, maidens, etc.)
* Multi-match history on device
* Export/import match JSON
* Tablet UI polish

---

If you find bugs or want a feature, open an issue here:
[https://github.com/usmanAfzalKhan/cricledger/issues](https://github.com/usmanAfzalKhan/cricledger/issues)

Enjoy scoring 🏏
