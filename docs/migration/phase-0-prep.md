# Phase 0 — Prep & Strip PTO

**Goal:** Turn `health-tracker-app` into a clean shell ready for health features. Remove all PTO/train code, fix project identity, and complete the auth flow skeleton.

**Estimated effort:** 2–4 hours

**Prerequisites:**

- Both repos accessible locally
- Backend API running at the same base URL the web app uses

**Next phase:** [phase-1-foundation.md](./phase-1-foundation.md)

---

## 0.1 Remove PTO-specific code

Delete these files entirely:

| File | Reason |
|------|--------|
| `components/NewOffDayDialog.jsx` | PTO feature |
| `components/OffDayCard.jsx` | PTO feature |
| `components/TrainBookingCard.jsx` | PTO feature |
| `components/NewTrainBookingDialog.jsx` | PTO feature |
| `components/ui/CustomDay.jsx` | Train calendar helper |
| `api-managers/OffDaysApiManager.js` | PTO API |
| `api-managers/TrainBookingApiManager.js` | PTO API |
| `schemas/OffDay.js` | PTO schema |
| `schemas/TrainBookingDay.js` | PTO schema |
| `constants/trainBooking.js` | PTO constants |
| `app/(tabs)/TrainBookingsPage.jsx` | PTO screen |

Also remove PTO-specific helpers from `lib/helpers.js`. Keep only generic utilities such as `getDateWithoutTime`. Delete train-booking, off-day, and weekend-skip logic.

Verify no remaining references:

```bash
grep -r "OffDay\|TrainBooking\|offday\|trainBooking" --include="*.{js,jsx,ts,tsx}" .
```

---

## 0.2 Rename project identity

**`package.json`**

- Change `"name": "pto-tracker-app"` → `"name": "health-tracker-app"`

**`app/(tabs)/_layout.tsx`**

- Remove Train / Off Days tab definitions and icons
- Use a minimal placeholder tab set until Phase 1 defines health tabs

**`app/(auth)/login.jsx`**

- Remove hardcoded test credentials if present (web login does not ship defaults)

---

## 0.3 Complete auth routes

Web has three auth screens; Expo only has login today.

| Web source | Expo target |
|------------|-------------|
| `health-tracker/src/pages/RegisterPage/RegisterPage.jsx` | `app/(auth)/register.jsx` |
| `health-tracker/src/pages/VerifyPage/VerifyPage.jsx` | `app/(auth)/verify/[emailToken].jsx` |

**`app/(auth)/_layout.jsx`** — register all screens:

```jsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="login" />
  <Stack.Screen name="register" />
  <Stack.Screen name="verify/[emailToken]" />
</Stack>
```

**Login register link** — fix route from `/register` to `/(auth)/register`.

**Porting notes for register/verify:**

- Follow `app/(auth)/login.jsx` for RN layout (`KeyboardAvoidingView`, `ScrollView`, `TextInput`, `Button`)
- Preserve web validation regexes and API endpoints (`/api/register`, `/api/verify`)
- Verify page: read `emailToken` from `useLocalSearchParams()` instead of `useParams()`

---

## 0.4 Align auth infrastructure with web

### `hooks/useAxiosPrivate.js`

Merge web's more robust refresh logic:

- Handle both `401` and `403` (Expo currently only handles 403)
- On refresh failure: call `setAuth({})` and reject
- Add `persist` and `setAuth` to the `useEffect` dependency array

Reference: `health-tracker/src/hooks/useAxiosPrivate.js`

### Keep (do not replace)

| File | Reason |
|------|--------|
| `context/AuthProvider.jsx` | SecureStore + web localStorage fallback |
| `components/PersistLogin.tsx` | Better than web version |
| `api/axios.js` | Platform-aware base URL |

---

## 0.5 Environment & API config

Document in `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

For physical devices, use your machine's LAN IP (e.g. `http://192.168.1.x:4000`).

Verify `api/axios.js` works on:

- iOS Simulator → `http://localhost:4000`
- Android Emulator → `http://10.0.2.2:4000`
- Expo Web → `http://localhost:4000`

---

## 0.6 Stub the tab layout

Replace `app/(tabs)/index.jsx` with a minimal placeholder:

```jsx
import { Text, View } from "react-native";

export default function OverviewScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Health Tracker — Overview (Phase 2)</Text>
    </View>
  );
}
```

Update `app/(tabs)/_layout.tsx` to a minimal shell (Overview + Logout) until Phase 1 adds full health tabs.

---

## Testing checklist

- [ ] App builds without PTO import errors
- [ ] Login works against backend
- [ ] Register screen renders and submits
- [ ] Verify route works with an email token
- [ ] Logout clears session and redirects to login
- [ ] Token refresh works when "Trust this device" is enabled
- [ ] No references to OffDay, TrainBooking, or PTO constants remain

---

## Exit criteria

- Clean Expo app with auth complete
- All PTO code removed
- Empty tab shell ready for health screens in Phase 1
