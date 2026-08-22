# Architecture (health-tracker-app)

Agent-oriented map of this repository. Everything below is taken from the code as it exists today.

This is the **Expo 54 / React Native 0.81** client for **health-tracker-server**. It runs as iOS, Android, and web (`expo start --web`). Feature screens are mostly `.jsx`; UI primitives and the root layout are `.tsx`. There is no backend in this repo.

Appearance (colors, NativeWind vars, navigation chrome) is documented in [docs/THEMING.md](./docs/THEMING.md). This file is the source of truth for structure, auth, data flow, and UI conventions that affect how you add features.

---

## What this app is

A signed-in workspace for one health-tracker **account**. The user logs in once, then can switch among **profiles** (family members) owned by that account. Screens then show that profile’s **reports** (lab readings over time) and **appointments**, against an investigation **catalog** that belongs to the account (not the profile).

There is no local database. TanStack Query is the cache; Axios talks to the API.

Deferred in this client (schema and comments still mention them; no UI): report file upload, in-app PDF viewing, OCR auto-fill. See `docs/migration/phase-4-advanced.md` and TODOs in `NewReportDialog.jsx` / `ReportCard.jsx`.

---

## Runtime and stack

| Piece | What the code uses |
|---|---|
| Entry | `package.json` `"main": "expo-router/entry"` |
| Routing | Expo Router 6, file-based under `app/` |
| UI | React Native 0.81, NativeWind 4, `@rn-primitives/*`, lucide-react-native |
| Data | `@tanstack/react-query` 5 + Axios 1 |
| Forms | `react-hook-form` + `@hookform/resolvers` + Zod 4 schemas in `schemas/` |
| Auth storage | `expo-secure-store` (native), httpOnly cookie + `localStorage` persist flag (web) |
| Charts | `react-native-svg` via `components/charts/LineChart.jsx` |
| Dates | `date-fns` 4; calendars via `react-native-calendars` |
| Theme | `lib/appearance.js` + `components/ThemeProvider.jsx`; live palette `APP_APPEARANCE = 'iosDark'` |
| Tests | Jest + `jest-expo`, `watchman: false`, `@/` mapped in `jest.config.js` |

`app.json` sets `userInterfaceStyle: "dark"`, `newArchEnabled: true`, experiments `typedRoutes` and `reactCompiler`, URL scheme `healthtrackerapp`. Web output is `"static"`.

---

## Directory map

```
app/                      Expo Router screens (the only place routes are defined)
  _layout.tsx             Providers + root Stack: (tabs) | (auth)
  (auth)/                 Login, register, verify — redirected away if auth.id is set
  (tabs)/                 Signed-in tab shell; redirected to login if auth.id is missing
    more/                 Nested stack: More menu, profiles, investigations
api/axios.js              Public Axios instance + axiosPrivate (auth header + web cookies)
api-managers/             One hook per resource; all authenticated calls go through useAxiosPrivate
context/AuthProvider.jsx  auth / persist / isLoading context
hooks/                    useAuth, useAxiosPrivate, useRefreshToken, useLogout, useValidatedForm
components/               Feature UI (dialogs, cards, charts, widgets) + FormSheetModal
  ui/                     rn-primitives / shadcn-style wrappers (button, select, alert-dialog, …)
schemas/                  Zod schemas for create/edit forms only (not API response types)
lib/                      appearance, report/investigation helpers, cn(), getDateWithoutTime
constants/                sort order, appointment time slots, persist key, card gap
docs/THEMING.md           Appearance system (do not re-implement colors in leaves)
docs/migration/           Historical phase plans; Phase 4 (PDF/OCR) is still deferred
```

Import alias: `@/*` → repo root (`tsconfig.json`). Nested routes under `app/(auth)/verify/` **must** use `@/api/axios` (and other `@/` paths). Relative `../../api/axios` from that file resolves incorrectly.

Some layouts still import hooks as `../../hooks/useAuth`. New code should use `@/`.

---

## Provider tree and navigation

`app/_layout.tsx` (outside-in):

1. `QueryClientProvider` — a module-level `new QueryClient()` with **default options** (staleTime 0).
2. `AuthProvider`
3. `@react-navigation/native` `ThemeProvider` (aliased `NavigationThemeProvider`) using `DarkTheme` plus `getAppearance(APP_APPEARANCE).reactNavigation.colors`
4. App `ThemeProvider` from `@/components/ThemeProvider` with `appearance={APP_APPEARANCE}`
5. `PersistLogin` wrapping the root `Stack`
6. `PortalHost` (`@rn-primitives/portal`) inside PersistLogin, sibling to the Stack
7. `Toast` from `react-native-toast-message` and `StatusBar` **outside** PersistLogin but inside ThemeProvider

`unstable_settings.anchor` is `'(tabs)'`.

Root stack screens: `(tabs)` and `(auth)`, both `headerShown: false`.

### Auth gate (how you get in or out)

| Layout | Condition | Effect |
|---|---|---|
| `app/(tabs)/_layout.tsx` | `isLoading` | Full-screen `ActivityIndicator` |
| `app/(tabs)/_layout.tsx` | `!auth?.id` | `<Redirect href="/(auth)/login" />` |
| `app/(auth)/_layout.jsx` | `auth?.id` | `<Redirect href="/" />` |

`PersistLogin` never unmounts children. It only drives `isLoading` / `setAuth` on startup. The tab layout is what actually blocks the UI.

Signed-in identity is **`auth.id`**, not `auth.accessToken`. Login stores `{ accessToken, isAdmin, name, id }` from `response.data.data`. Refresh merges those same four fields into previous auth.

### Tab shell

`app/(tabs)/_layout.tsx` `Tabs`, `headerShown: true`, `tabBarButton: HapticTab`, `...appTheme.navigation` for header/tab colors.

| Route file | Tab label | Header title | In tab bar? |
|---|---|---|---|
| `index.jsx` | Home | Overview | Yes |
| `analyse.jsx` | Analyse | Analyse Reports | Yes |
| `compare.jsx` | Compare | Compare Reports | Yes |
| `reports.jsx` | Manage | Manage Reports | Yes |
| `more/` | More | (stack owns headers) | Yes |
| `appointments.jsx` | — | Appointments | **No** (`href: null`) |

Appointments is still a registered tab route. It is hidden from the bar (comment in the layout: it pulled focus away from health metrics). Overview’s `AppointmentsWidget` is also commented out. Nothing in the More menu links to it. The screen is reachable only by a direct path or by the widget’s `href` if that widget is re-enabled.

More stack (`app/(tabs)/more/_layout.tsx`): `index` (More), `profiles`, `investigations`. Header back title is `'More'`.

There are also files at `app/(tabs)/more/analyse-reports/` (`index.jsx` and `[investigation].jsx`). They are **not** listed in the More stack options and **not** linked from `more/index.jsx`. The live Analyse UI is the **Analyse tab** (`app/(tabs)/analyse.jsx`). Treat the More copies as leftover routes unless you are deleting them.

---

## Talking to the API

### Base URL

`api/axios.js` `getBaseURL()`:

1. `process.env.EXPO_PUBLIC_API_URL` if set (see `.env.example`)
2. Else Android → `http://10.0.2.2:4000`
3. Else `http://localhost:4000` (iOS simulator and web)

Two Axios instances:

- **default export** — JSON `Content-Type`, used for login / register / verify / refresh / logout.
- **`axiosPrivate`** — same headers, plus `withCredentials: true` **only when `Platform.OS === 'web'`**. Native does not send cookies.

Authenticated feature code must use `useAxiosPrivate()`, not the public instance. API managers all call that hook.

### Access vs refresh (what this client actually does)

```
Login POST /api/login
  body { username, password }
  web: withCredentials so Set-Cookie jwt is stored
  then setAuth({ accessToken, isAdmin, name, id })
  then storeRefreshToken(refreshToken)  // no-op on web; on native writes SecureStore key "refreshToken"

Protected calls
  interceptor sets Authorization: Bearer ${auth.accessToken} if missing

401 or 403 on a private call, and persist === true, and request not already retried
  → refresh() then replay with the new access token
  → refresh failure: setAuth({})

Logout
  setAuth({}); setPersist(false)
  web: GET/POST axios("/api/logout", { withCredentials: true }); remove localStorage persist
  native: axios("/api/logout") with Authorization: Bearer <SecureStore refreshToken>; delete SecureStore keys
```

`useRefreshToken`:

- **Web:** `GET /api/refresh` with `withCredentials: true` (cookie `jwt`). This matches health-tracker-server.
- **Native:** `GET /api/refresh` with `Authorization: Bearer <stored refresh token>`. The current server **ignores** Authorization on `/api/refresh` and only reads cookie `jwt`. Login JSON also does **not** include `refreshToken`, so `storeRefreshToken` stores `undefined`. Native “Trust this device” persist against that server therefore cannot complete a cookie-less refresh.

`PersistLogin` runs `refresh()` on launch only when `persist && !auth?.accessToken`. The persist flag is the “Trust this device?” checkbox on login (`constants/auth.js` `PERSIST_KEY = "persist"`). Web: `localStorage`. Native: SecureStore. `useAxiosPrivate` **skips** the 401/403 refresh retry when `persist` is false.

`useLogout` on native sends the refresh token as Bearer. The server logout handler only reads cookie `jwt`. Native logout still clears local auth either way.

### Auth context shape

`AuthProvider` value: `{ auth, setAuth, persist, setPersist, persistLoaded, isLoading, setIsLoading }`.

`auth` starts as `{}`. After login it is `{ accessToken, isAdmin, name, id }`. `id` after login is `User._id` from the server, which equals the **primary** profile’s `user` field. After a server-side profile switch, login `id` and active `Profile.user` can diverge — see Profiles below.

There is no persisted access token. Reloading the app with persist on tries refresh; without persist, `auth` is empty and the tab layout redirects to login.

---

## Data layer

### API managers

Each is a hook (so it can call `useAxiosPrivate`) returning async functions. They are **not** React Query hooks themselves. Screens wrap them in `useQuery` / `useMutation`.

| Hook | Paths | Notes |
|---|---|---|
| `useReportsApiManager` | `/api/reports`, `/compare`, `PUT/DELETE /:id` | Create/update send `timestamp: date.valueOf()` (ms). Create also sends a `report` field in **JSON**, not multipart. `readReports` / `compareReports` swallow errors (`console.log`) and can return `undefined` |
| `useAppointmentsApiManager` | `/api/appointments` | Combines form `date` + `time` (`HH:mm`) with `date-fns` `add`. `createAppointment` returns early with no throw if fields missing; errors are logged, not thrown. `deleteAppointment` is used by the appointments screen despite an in-file comment “not being used right now” |
| `useProfileApiManager` | `/api/profiles`, `/switch`, `DELETE /:id` | `changeProfile` posts `{ profile }`. Errors logged, not thrown |
| `useInvestigationsApiManager` | `/api/investigations` | Create/update throw `Error(server message)`. List logs errors and may return `undefined` |

Public auth screens call `axios` from `@/api/axios` directly (`/api/login`, `/api/register`, `/api/verify`). Register body is `{ name: profileName, username, password }`.

### React Query keys (as written)

Invalidating a prefix invalidates longer keys (TanStack Query default).

| Key | Used by |
|---|---|
| `['investigations']` | Overview, Analyse, Compare, reports screen, HealthGraph, dialogs, More/investigations |
| `['investigations', investigation]` | leftover `more/analyse-reports/[investigation].jsx` only |
| `['reports']` | Manage Reports list |
| `['reports', investigation, count]` | Home `HealthGraph` |
| `['reports', fromDate, toDate, investigation]` | Analyse tab |
| `['compare', fromDate, toDate, investigation1, investigation2]` | Compare tab |
| `['appointments']` | Appointments screen |
| `['appointments-widget', type, count]` | `AppointmentsWidget` |
| `['profiles']` | More/profiles, User menu |
| `['latest']` | **Never queried.** Still `invalidateQueries`'d after report create/update/delete |

Profile switch in `components/User.jsx` calls `queryClient.invalidateQueries()` with **no key** (invalidate everything), then `router.replace('/')`.

It does **not** call `setAuth` with the switch response (`accessToken`, `id`, `name`, `isAdmin`). Subsequent private calls keep using the **old** access token until a 401/403 + persist refresh (web cookie) replaces it. On native, that refresh path is the Bearer-refresh mismatch above.

### Timestamps and dates

Server stores numeric timestamps. The client:

- Writes `date.valueOf()` (local Date → ms).
- Appointments: date at 00:00 plus `TIME_SLOTS` (`constants/appointments.js`, 30-minute `HH:mm` strings) via `add({ hours, minutes })`.
- Displays with `date-fns` (`MMM dd, yyyy`, etc.) in `lib/reportUtils.js`.
- Analyse / Compare persist `from` / `to` in **route params** as `String(date.valueOf())`.
- `FormDateField` sets `new Date(day.dateString)` from `react-native-calendars` (ISO date string, not the calendar `timestamp` field).
- `getDateWithoutTime` (`lib/helpers.js`) subtracts H:M:S of the local day; used by `AppointmentsWidget` for from/to bounds.

`SORT_ORDER.ASC` / `DESC` in `constants/sort.js` is sent as the reports `order` query param and used client-side in `sortReportsByTimestamp`.

---

## Screens and features

### Auth (`app/(auth)/`)

**Login** (`login.jsx`): public axios POST. Client-side required fields only (no Zod). Checkbox “Trust this device?” writes `persist`. Default input values in source are a prefilled email and password.

**Register** (`register.jsx`): live regex checks, not Zod.

- Profile name: `/^[a-zA-Z][a-zA-Z0-9 ]{3,10}$/`
- Email: `/^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/` (the `.` before the TLD is unescaped)
- Password: `/^[a-zA-Z][a-zA-Z0-9]{3,10}$/`

Success UI tells the user to check email; it does not auto-login.

**Verify** (`verify/[emailToken].jsx`): on mount POSTs `{ token }` from the route param. The Expo path is `/(auth)/verify/<token>`. health-tracker-server’s verification email currently links to `http://localhost:5173/verify/<token>` (Vite), not this route.

### Overview (`app/(tabs)/index.jsx`)

Loads `['investigations']`. Renders `HealthGraph` for slugs in `HOME_WIDGET_SLUGS = ['hba1c', 'hdl']`, **filtered** to slugs that exist in the account catalog. Each graph fetches `readReports({ investigation, count: 5 })` and sorts ASC for the chart. Footer link: Analyse tab with `params: { investigation }`.

`AppointmentsWidget` is imported nowhere on this screen (commented out).

### Analyse (`app/(tabs)/analyse.jsx`)

Filter state is **URL params**: `investigation`, `from`, `to`. `InvestigationSelect` (a `FormSheetModal` list with search) + `DateRange` + `LineChart` + read-only `ReportCard`s. Query disabled until an investigation is chosen. Chart data is re-sorted ASC; the list stays DESC from the API.

### Compare (`app/(tabs)/compare.jsx`)

URL params `investigation1`, `investigation2`, `from`, `to`. Calls `compareReports` which hits `GET /api/reports/compare?investigations=a,b`. Renders `CompareGraph` → `LineChart` with `yAxisKeys` equal to the two slugs (independent Y scales per series inside `buildLinePoints`).

### Manage Reports (`app/(tabs)/reports.jsx`)

Full list `order: DESC`, `withDisplayDates`. FAB opens `NewReportDialog`. Edit/delete via `ReportCard` overflow menu + `AlertDialog`. Can be opened with params `showNewReportDialog=true` and `appointment=<id>` (from the appointments widget “Link a report” link). Linking the appointment in the form UI is **commented out** in `NewReportDialog`.

Create/update do not send multipart. Zod schema `schemas/Report.js` still has optional `report` file (3MB comment vs 5MB error string; types png/jpeg/pdf) but the dialog has no file field.

### Appointments (`app/(tabs)/appointments.jsx`)

List + `NewAppointmentDialog` + delete. Hidden from the tab bar as noted above.

### More (`app/(tabs)/more/index.jsx`)

`UserMenu` (`components/User.jsx`) + links to Profiles and Investigations + Logout. Logout on this screen does **not** `router.replace` (comment in file: the auth gate redirects). `UserMenu` logout **does** `router.replace('/(auth)/login')`.

### Profiles (`more/profiles.jsx`)

`GET /api/profiles`. Create via `NewProfileDialog` (`name`, `gender` Male/Female, `age` as number). Delete is offered on `ProfileCard` only when `auth.isAdmin && user !== parent` (cannot delete the admin/primary profile from the UI). `isAdmin` on the card is `auth.isAdmin` from **login**, which is `User.isAdmin` on the server, not the refresh/switch “is this the primary profile” boolean.

Switching profiles is only in `UserMenu` → Switch Profile. It posts `Profile.user` to `/api/profiles/switch`. Current profile is shown with a check when `profile.user === auth.id`.

### Investigations (`more/investigations.jsx`)

Account catalog CRUD. Create auto-slugifies `label` via `slugifyLabel` until the user edits the slug. Edit cannot change `value` (`editable={!isEdit}`), matching the server (slug immutable).

---

## UI conventions (load-bearing)

### Forms

Create/edit sheets:

1. Zod schema in `schemas/`
2. `useValidatedForm({ schema, defaultValues })` → `{ form, canSubmit }` (`canSubmit` is `schema.safeParse(values).success && !isSubmitting`)
3. `FormSheetModal` wrapping `<Form {...form}>` and field components
4. Submit: `form.handleSubmit(mutationFn)`
5. On success: reset form, `onOpenChange(false)`, invalidate query keys, `toast({ description })`

Field components: `form-field-input`, `form-field-select`, `form-field-textarea`, `FormDateField`. Select options are `{ label, value }` arrays.

Auth screens (login/register) are **not** on this stack; they use raw `TextInput` + regex/required checks.

### Form sheets → `FormSheetModal`, not `Dialog`

All create/edit flows use `components/FormSheetModal.jsx`: React Native `Modal`, `presentationStyle="pageSheet"`, `animationType="slide"`.

- Close: `CircleX` → `onOpenChange(false)`
- Primary action: **`footer`** (Save `Button`) **or** **`onConfirm`** (tick in the toolbar). `NewReportDialog` uses `onConfirm`.
- Nested `ThemeProvider` inside the Modal (new native window cannot inherit NativeWind `vars`). See THEMING.md.
- `scrollable={false}` for list-heavy sheets (`InvestigationSelect`)

`components/ui/dialog.tsx` remains in the repo. Do not use it for form modals: save buttons clipped inside `DialogContent` + `ScrollView`, and nested `Modal` / calendars conflict with `FullWindowOverlay` on iOS.

### Deletes → `AlertDialog`

`ProfileCard`, `AppointmentCard`, `ReportCard` (and the same pattern on investigation cards) use `components/ui/alert-dialog.tsx`. Small confirms, not sheets.

### Date picking

In forms: **`FormDateField`** — accordion (`Expanding`) + inline `react-native-calendars`. No popover, no extra Modal.

On full screens (Analyse / Compare): **`DateRange`** may open a bottom-sheet `Modal` for the calendar. That is valid **outside** a form sheet. It nests `ThemeProvider` inside that Modal.

### Cards and overflow menus

`CardView` is `rounded-[10px] bg-card` plus an optional ellipsis `DropdownMenu` of `{ label, action, variant? }`. Destructive items use `variant: 'destructive'`.

### Investigation picking on Analyse/Compare

`InvestigationSelect` is a searchable list in `FormSheetModal`, **not** `form-field-select`. Form dialogs that pick an investigation (new report) use `FormFieldSelect` with the catalog as `dropdownOptions`.

### Toasts

Feature code calls `useToast()` from `hooks/use-toast.ts` (`toast({ description })`). That is an in-memory shadcn-style reducer. There is **no** `components/ui/toast` renderer. `react-native-toast-message` `<Toast />` is mounted in the root layout, but nothing calls `Toast.show()`. Success/error `toast({ description })` currently has **no visible UI**. Do not assume toasts appear until one of those two systems is wired up.

---

## Charts

`components/charts/LineChart.jsx` (react-native-svg). Geometry lives in `chartUtils.js`: `buildLinePoints`, axis ticks (min / mean / max), date labels, independent scales when `yKeys.length > 1`.

Colors come from `useTheme().chart` (`line`, `lineSecondary`, `axis`, `label`) — not hardcoded hex in the chart. Home and Analyse pass `yAxisKey` default `'value'`. Compare passes `yAxisKeys` = investigation slugs (the compare API returns objects keyed by slug plus `timestamp`).

---

## Appearance (summary)

Do not implement colors per screen. Full rules: [docs/THEMING.md](./docs/THEMING.md).

- Switch the whole app with `APP_APPEARANCE` in `lib/appearance.js` (currently `'iosDark'`).
- Leaves: NativeWind tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`, `text-destructive`, `border-input`, …).
- `useTheme()` from `@/components/ThemeProvider` only for RN props that cannot take `className` (placeholder color, keyboard, calendar theme, lucide `color`, RefreshControl, SVG).
- Re-apply `theme.vars` on portal roots (`SelectContent`, `DropdownMenuContent`, `AlertDialogContent`) and nest `ThemeProvider` inside every RN `Modal`.
- Do not use `dark:` variants or `hooks/use-theme-color.ts` / `lib/theme.ts` `Colors` for this system. Those are Expo-template leftovers.

---

## Tests

`npm test` → Jest with `jest-expo`. Current coverage is unit tests around pure helpers:

- `lib/__tests__/appearance.test.js`
- `lib/__tests__/reportUtils.test.js`
- `lib/__tests__/investigationUtils.test.js`
- `lib/__tests__/helpers.test.js`
- `lib/__tests__/utils.test.ts`
- `components/charts/__tests__/chartUtils.test.js`

No screen, API-manager, or auth integration tests.

---

## Invariants to preserve

1. **`(tabs)` redirects when `!auth.id`; `(auth)` redirects when `auth.id`.** Do not add a third gate that fights those.
2. **Private HTTP goes through `useAxiosPrivate`.** Using the public axios instance on a protected route skips the Bearer interceptor and the 401 retry.
3. **`req.user` vs `req.profile` on the server:** this client’s `auth.id` after login is the account id (primary profile). Reports/appointments the server returns are for the **access token’s `profile` claim**. Switching profiles without updating `auth` (current `User.jsx`) leaves the old claim in memory.
4. **Investigation `value` is the slug** stored on reports and used as Compare series keys. Do not display it as the title when a `label` exists (`getInvestigationLabel`).
5. **Form create/edit = `FormSheetModal` + Zod + `useValidatedForm`.** Deletes = `AlertDialog`. Form dates = `FormDateField`.
6. **`@/` imports from nested `app/` routes.** Especially `app/(auth)/verify/[emailToken].jsx`.
7. **Do not wrap screens in `ThemeProvider`.** Only root, Modals, and portal roots.
8. **Keep `/download` and file/OCR work in Phase 4.** Wiring a file input into `createReport` as JSON will not match the server’s multer field `report`.
9. **Query keys:** invalidate `['reports']` after writes (covers `['reports', …]` prefixes). Invalidate `['investigations']` after catalog writes. Invalidate `['appointments']` and `['appointments-widget']` together. `['compare', …]` is a different prefix; report writes do **not** currently invalidate it.
10. **Hidden Appointments tab** (`href: null`) is intentional. Re-enabling it is a product change, not a missing file.

---

## How to add a feature (mechanical)

1. If it needs a route, add a file under `app/`. Tab vs More stack vs auth stack is a product choice; More is for account-level settings (profiles, investigations).
2. API: function on the existing manager in `api-managers/`, or a new manager that uses `useAxiosPrivate`.
3. Screen: `useQuery` / `useMutation` with the keys in the table above (or a new prefix you will invalidate on write).
4. Form: schema + `useValidatedForm` + `FormSheetModal` + field components. Invalidate on success.
5. Styling: semantic classes + `useTheme()` only for RN-only props. New Modal/portal: re-apply appearance vars (THEMING.md).
6. Do not add Recharts, web `Dialog`, or `dark:` color forks.
