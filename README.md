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

Conventions for forms, modals, date pickers, and repo cross-references: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Prerequisites

- Node.js 18+
- [health-tracker-server](https://github.com/your-org/health-tracker-server) or compatible API running (default: `http://localhost:4000`)
- For physical devices: API reachable on your LAN

## Setup

```bash
npm install
cp .env.example .env
```

Configure `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For Android emulator use `http://10.0.2.2:4000` (default when unset).  
For a physical device use your machine IP, e.g. `http://192.168.1.10:4000`.

## Run

```bash
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web).

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

- Expo 54 + Expo Router
- React Native + NativeWind
- TanStack Query + Axios
- react-native-svg for charts

## Migration notes

This app was migrated from a PTO/train booking Expo template into a health-only app.  
Historical phase-by-phase plans: [docs/migration/README.md](./docs/migration/README.md)
