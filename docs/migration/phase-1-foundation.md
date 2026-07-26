# Phase 1 — Foundation (Shared Logic Layer)

**Goal:** Copy all platform-agnostic business logic from the web app. Set up navigation structure and shared UI building blocks used by every screen.

**Estimated effort:** 4–6 hours

**Prerequisites:** [Phase 0 complete](./phase-0-prep.md)

**Next phase:** [phase-2-core-crud.md](./phase-2-core-crud.md)

---

## 1.1 Copy API managers

From `health-tracker/src/apiManagers/` → `api-managers/`:

| Source | Destination |
|--------|-------------|
| `AppointmentsApiManager.js` | `api-managers/AppointmentsApiManager.js` |
| `ReportsApiManager.js` | `api-managers/ReportsApiManager.js` |
| `InvestigationsApiManager.js` | `api-managers/InvestigationsApiManager.js` |
| `ProfileApiManager.js` | `api-managers/ProfileApiManager.js` |

Import path `../hooks/useAxiosPrivate` should work unchanged.

---

## 1.2 Copy schemas

From `health-tracker/src/schemas/` → `schemas/`:

| File | Action |
|------|--------|
| `Appointment.js` | Copy |
| `Report.js` | Copy |
| `Profile.js` | Already exists — verify identical, keep one |

**Note:** Expo uses Zod v4; web uses v3. These schemas are simple — test `zodResolver` after copy. Adjust syntax only if validation breaks.

---

## 1.3 Merge helpers

From `health-tracker/src/lib/helpers.js` → merge into `lib/helpers.js`.

Web currently exports `getDateWithoutTime` (likely already in Expo). Add health-specific helpers as needed during later phases.

---

## 1.4 Define navigation structure

Replace PTO tabs with a health layout mirroring the web sidebar.

### Bottom tabs — `app/(tabs)/_layout.tsx`

| Tab | Route file | Web equivalent | Icon suggestion |
|-----|-----------|----------------|-----------------|
| Overview | `index.jsx` | `/` HomePage | `house.fill` |
| Appointments | `appointments.jsx` | `/appointments` | calendar |
| Reports | `reports.jsx` | `/reports` | document / edit |
| More | `more/_layout.tsx` | remaining sidebar items | ellipsis |

Keep the existing auth guard and loading spinner pattern in `_layout.tsx`.

### Stack under More — `app/(tabs)/more/`

| Route | Web equivalent |
|-------|----------------|
| `index.jsx` | Menu hub |
| `analyse-reports/index.jsx` | `/analyse-reports` |
| `analyse-reports/[investigation].jsx` | `/analyse-reports/:investigation` |
| `compare.jsx` | `/compare` |
| `profiles.jsx` | `/profiles` |

### Stub files

Create every route file with a placeholder so navigation compiles:

```jsx
import { Text, View } from "react-native";

export default function StubScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Coming in Phase 2/3</Text>
    </View>
  );
}
```

---

## 1.5 Port shared non-page components

| Web source | Expo target | Notes |
|------------|-------------|-------|
| `src/components/PageHeader/PageHeader.jsx` | `components/PageHeader.jsx` | Used on every page |
| `src/components/User/User.jsx` | `components/User.jsx` | Profile switcher → More menu |
| `src/components/CardView/CardView.jsx` | `components/CardView.jsx` | Already exists — verify parity |
| `src/components/FormElements/FormFieldInput.jsx` | `components/ui/form-field-input.jsx` | Keep Expo version |
| `src/components/FormElements/FormFieldSelect.jsx` | `components/ui/form-field-select.jsx` | Keep Expo version |
| `src/components/FormElements/FormFieldTextarea.jsx` | `components/ui/form-field-textarea.jsx` | Keep Expo version |

**PageHeader example:**

```jsx
import { Text, View } from "react-native";

export default function PageHeader({ text }) {
  return (
    <View className="border-b border-border px-4 py-3">
      <Text className="text-xl font-semibold">{text}</Text>
    </View>
  );
}
```

---

## 1.6 Add missing UI primitives

Web components not yet in Expo — add before Phase 2:

| Web component | Expo action |
|---------------|-------------|
| `ui/skeleton.tsx` | Create RN skeleton (animated `View` placeholders) |
| `ui/checkbox.tsx` | Needed for DateRange in Phase 3 |
| `ui/label.tsx` | Simple `Text` wrapper if needed for forms |

Do **not** port web-only components: `ui/input.tsx`, `ui/chart.tsx`, `ui/command.tsx`, `ui/calendar.tsx` (use Expo form-fields and `react-native-calendars` instead).

Reference web shadcn source for API shape; implement with `@rn-primitives` + NativeWind.

---

## 1.7 Verify root layout

Confirm `app/_layout.tsx` wraps:

- `QueryClientProvider`
- `AuthProvider`
- `PersistLogin`
- `PortalHost`
- `Toast` (`react-native-toast-message`)

No changes expected unless adding global providers later.

---

## Web → Expo pattern reference

| Web | Expo |
|-----|------|
| `react-router-dom` `Link` | `expo-router` `Link` |
| `useNavigate()` | `useRouter()` |
| `useSearchParams()` | `useLocalSearchParams()` |
| `useParams()` | `useLocalSearchParams()` |
| `lucide-react` | `lucide-react-native` |
| CSS Modules | NativeWind `className` |
| `<div>`, `<input>` | `<View>`, `<TextInput>` |

---

## Testing checklist

- [ ] All 4 API managers import without errors
- [ ] All route stubs render when navigating every tab and More sub-screen
- [ ] Auth guard still redirects unauthenticated users
- [ ] `PageHeader` renders on a stub screen
- [ ] No PTO files or imports remain

---

## Exit criteria

- All health API managers and schemas in place
- Full navigation skeleton compiles
- Shared components ready for screen ports in Phase 2
