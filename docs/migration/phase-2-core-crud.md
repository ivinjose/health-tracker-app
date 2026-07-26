# Phase 2 — Core CRUD Screens

**Goal:** Port the four areas that handle create/read/update flows for health data. No charts, PDF, or OCR in this phase.

**Estimated effort:** 2–3 days

**Prerequisites:** [Phase 1 complete](./phase-1-foundation.md)

**Next phase:** [phase-3-analytics.md](./phase-3-analytics.md)

---

## Reference pattern

For every screen, follow the established Expo pattern:

- `useForm` + `zodResolver` + `@tanstack/react-query`
- RN `Modal` or `components/ui/dialog`
- `form-field-input`, `form-field-select`, `form-field-textarea`
- `useToast` for success/error feedback
- NativeWind on RN components

See `app/(auth)/login.jsx` and (git history) former PTO dialog components.

---

## 2.1 Profiles (do first — simplest)

### Web sources

- `health-tracker/src/pages/ProfilesPage/ProfilesPage.jsx`
- `health-tracker/src/components/ProfileCard/ProfileCard.jsx`
- `health-tracker/src/schemas/Profile.js`

### Expo targets

- `app/(tabs)/more/profiles.jsx`
- `components/ProfileCard.jsx`
- `components/NewProfileDialog.jsx`

### Tasks

1. Copy React Query logic: `readProfiles`, `addProfile`, `changeProfile`, `deleteProfile`
2. Build list UI: `ScrollView` + `ProfileCard` per profile
3. Build create dialog: name, age, gender via form-field components
4. Wire active profile switching (`ProfileApiManager.changeProfile` + auth context)
5. Add empty state and loading skeleton
6. Toast on success/error

### Web → Expo mapping

| Web | Expo |
|-----|------|
| `useState(showNewProfileDialog)` | Same, or Dialog `open` prop |
| Radix `Dialog` | `components/ui/dialog.tsx` |
| `Skeleton` | Skeleton from Phase 1 |
| `Plus` icon | `lucide-react-native` |
| CSS Module layout | NativeWind classes |

---

## 2.2 Appointments

### Web sources

- `health-tracker/src/pages/AppointmentsPage/AppointmentsPage.jsx`
- `health-tracker/src/components/AppointmentCard/AppointmentCard.jsx`
- `health-tracker/src/schemas/Appointment.js`

### Expo targets

- `app/(tabs)/appointments.jsx`
- `components/AppointmentCard.jsx`
- `components/NewAppointmentDialog.jsx`

### Logic to preserve

- `TIME_SLOTS` array (48 half-hour slots)
- Form fields: profile, doctor, date, time slot, remarks
- Deep link: `?showNewAppointmentDialog=true` → `useLocalSearchParams()`
- React Query: list, create mutation, invalidate on success

### UI adaptations

- **Date picker:** `react-native-calendars` inside Modal (same pattern as former off-day dialog)
- **Time slot:** `form-field-select` with `TIME_SLOTS`
- **Profile select:** options from `ProfileApiManager.readProfiles()`

---

## 2.3 Reports (manual entry only)

### Web sources

- `health-tracker/src/pages/ReportsPage/ReportsPage.jsx`
- `health-tracker/src/components/ReportCard/ReportCard.jsx`
- `health-tracker/src/schemas/Report.js`

### Expo targets

- `app/(tabs)/reports.jsx`
- `components/ReportCard.jsx`
- `components/NewReportDialog.jsx`

### Port in this phase

- List reports with filters (investigation, count)
- Create report form: investigation, value, date, remarks, optional appointment link
- Investigation dropdown from `InvestigationsApiManager.readInvestigations()`

### Defer to Phase 4

- File upload input
- `tesseract.js` OCR
- `pdf-parse` text extraction
- `PDFViewer` / `ViewReport`

Add `// TODO Phase 4` where upload/OCR UI existed in web.

---

## 2.4 Overview (Home)

### Web sources

- `health-tracker/src/pages/HomePage/HomePage.jsx`
- `health-tracker/src/components/Widgets/Appointments/Appointments.jsx`
- `health-tracker/src/components/Widgets/HealthGraph/HealthGraph.jsx`

### Expo target

- `app/(tabs)/index.jsx`

### Port in this phase

- **Appointments widget:** upcoming + past lists (reuse `AppointmentCard`, limit count)
- **Layout:** web two-column → single-column `ScrollView` on mobile

### Defer to Phase 3

- **HealthGraph widget** — placeholder card or simple latest-value text:

```jsx
// Temporary until Phase 3 charts
const { data } = useQuery({
  queryKey: ["latest", investigation],
  queryFn: () => reportsApiManager.readReports({ investigation, count: 1 }),
});
```

---

## Cross-cutting patterns

Apply on every Phase 2 screen:

| Concern | Implementation |
|---------|----------------|
| Search params | `useLocalSearchParams()` |
| Navigation | `useRouter()` from `expo-router` |
| List loading | Skeleton `View`s |
| Empty state | Centered `Text` + optional "Add" CTA |
| Add action | Header button or fixed bottom FAB |
| Form validation | Zod + `FormMessage` |
| Cache invalidation | `queryClient.invalidateQueries` with correct keys |
| Keyboard | `KeyboardAvoidingView` on forms |
| Safe area | `useSafeAreaInsets` on dialogs |

---

## Suggested order of work

1. Profiles (validates full stack)
2. Appointments (date/time pickers)
3. Reports (investigation select, no upload)
4. Overview (compose widgets)

---

## Testing checklist

- [ ] Create, list, and switch profiles
- [ ] Create and list appointments with date/time
- [ ] Create and list reports (manual entry)
- [ ] Overview shows upcoming/past appointments
- [ ] Forms show Zod validation errors
- [ ] Mutations invalidate correct query keys
- [ ] Works on iOS simulator, Android emulator, Expo web

---

## Exit criteria

User can manage profiles, appointments, and reports end-to-end on mobile. Overview shows appointment widgets. Charts and file upload explicitly deferred.
