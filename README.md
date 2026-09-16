# Health Tracker (Expo)

Mobile and web client for the Health Tracker app, migrated from the Vite web app (`health-tracker`).

## Features

- Login, register, and email verification
- Overview dashboard with appointments and health metric charts
- Appointments, reports, and profiles CRUD
- Analyse reports and compare investigations over time
- Secure token storage on iOS/Android (SecureStore) and cookie auth on web

## Deferred (not yet on mobile)

- Report file upload and in-app PDF viewing
- OCR auto-fill from uploaded reports

See [docs/migration/phase-4-advanced.md](./docs/migration/phase-4-advanced.md) if you want to add these later.

## Architecture

Conventions for structure, auth, data flow, forms, and navigation: [ARCHITECTURE.md](./ARCHITECTURE.md). Appearance/theming: [docs/THEMING.md](./docs/THEMING.md).

## Prerequisites

- Node.js 20.19.4+ (22 recommended; see `.nvmrc`)
- [health-tracker-server](https://github.com/your-org/health-tracker-server) or compatible API running (default: `http://localhost:4000`)
- For physical devices: API reachable on your LAN
- [Expo Go](https://apps.apple.com/app/expo-go/id982107779) on the iPhone, **same SDK as this project** (currently **57**). The App Store build must match; a newer or older Expo Go will refuse to open the project.

## Setup

```bash
npm install
```

The API host is `API_ORIGIN` in `api/axios.js` (`http://localhost:4000` by default). There is no `.env` for that.

## Run

```bash
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web). For a physical iPhone, see [Run on an iPhone (Expo Go)](#run-on-an-iphone-expo-go).

## Run on an iPhone (Expo Go)

Use this after a Mac restart or any time you want the app on a physical iPhone. Expo Go is a development client: the Mac must stay on, and the phone must reach both Metro and the API.

A standalone Home Screen IPA (TestFlight / ad hoc) is a different path and needs an Apple Developer Program membership. This section is Expo Go only.

### One-time

1. Install Expo Go from the App Store on the iPhone.
2. Install Node 22 (`nvm install` reads `.nvmrc`). This repo does not run on Node 18.
3. From this repo:

```bash
nvm use
npm install
```

### Every time (including after a Mac restart)

**1. Same Wi‑Fi** — iPhone and Mac on the same network. Guest / client-isolation Wi‑Fi often blocks this.

**2. Confirm the Mac LAN IP** (it can change after a restart):

```bash
ipconfig getifaddr en0
```

Set `API_ORIGIN` in `api/axios.js` to that URL. `localhost` works on the iOS Simulator; it does **not** work on a phone.

```js
export const API_ORIGIN = 'http://YOUR_MAC_LAN_IP:4000';
```

Example: `http://192.168.1.4:4000`.

**3. Start the API** (from `health-tracker-server`):

```bash
npm start
```

Leave this running. Allow port **4000** in macOS Firewall if login hangs with “no server response.”

**4. Start Expo with Node 22** (nvm’s default may still be 18):

```bash
cd /path/to/health-tracker-app
nvm use
npx expo start
```

If you changed `.env` after Metro was already running, stop it (`Ctrl+C`) and start again. Use `npx expo start -c` after a dependency or SDK change.

**5. Confirm LAN, not localhost** — above the QR you want something like:

`Metro waiting on exp://192.168.x.x:8081`

If you see `127.0.0.1` or `localhost`, press `s` in that terminal until it is using LAN.

**6. Open on the phone** — Camera app → scan the QR → open in Expo Go. Or open Expo Go and scan from there. Allow Local Network access if iOS asks.

### What success looks like

Health Tracker loads inside Expo Go. Log in with an account that is **already email-verified**.

If the JS bundle never loads, the QR / LAN / Wi‑Fi step is wrong. If the UI loads but login cannot reach the server, the phone cannot reach `API_ORIGIN` (wrong IP, API not running, or firewall).

### New accounts

Register creates the user, but login requires `isEmailVerified`. Verification mail currently goes to Ethereal (it does not arrive in a real inbox), and the link in that mail points at the old web app. After someone registers, verify from the Mac, then they can log in on the phone:

```bash
# token = that user's emailToken in Mongo
curl -X POST http://localhost:4000/api/verify \
  -H 'Content-Type: application/json' \
  -d '{"token":"PASTE_EMAIL_TOKEN"}'
```

Or set `isEmailVerified: true` on that user in Mongo.

### Friend’s iPhone

Same Expo Go SDK 57, same Wi‑Fi, same QR. Each person should use their own account. No Apple Developer Program needed for this path.

## Project structure

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens |
| `api-managers/` | API hooks (reports, appointments, etc.) |
| `components/` | UI and feature components |
| `components/charts/` | SVG line charts (`react-native-svg`) |
| `schemas/` | Zod form schemas |
| `docs/migration/` | Migration plan from web app |

## Tech stack

- Expo 57 + Expo Router
- React Native + NativeWind
- TanStack Query + Axios
- react-native-svg for charts

## Migration notes

This app was migrated from a PTO/train booking Expo template into a health-only app.  
Historical phase-by-phase plans: [docs/migration/README.md](./docs/migration/README.md)
