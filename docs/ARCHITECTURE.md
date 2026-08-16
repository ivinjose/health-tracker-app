# Architecture & agent context

Reference for humans and coding agents working in **health-tracker-app**. Documents conventions established during migration from the Vite web app and alignment with the sibling Expo app **pto-tracker-app**.

## Related repos

| Repo | Role | Stack |
|------|------|-------|
| `health-tracker` | Source web app (feature reference) | Vite, react-router-dom, CSS Modules, Radix web, Recharts |
| `health-tracker-app` | Target mobile/web app (this repo) | Expo Router, NativeWind, `@rn-primitives`, react-native-svg |
| `pto-tracker-app` | **UI pattern reference** for Expo forms/modals | Same stack as this repo; forked from PTO features before health migration |

When porting UI, prefer copying **pto-tracker-app** Expo patterns over reusing web `Dialog` / Popover patterns from `health-tracker`.

## Migration principle

**Port logic, rebuild UI.**

- Copy with minimal edits: API managers, Zod schemas, React Query keys/mutations, auth hooks.
- Reimplement: pages, layout, charts (Recharts → react-native-svg), file/PDF/OCR (deferred Phase 4).
- Use `@/` path alias for all cross-layer imports (never depth-based `../../` from nested routes).

## Navigation

- **Expo Router** file-based routes under `app/`.
- Auth gate: `PersistLogin` + `AuthProvider` in `app/_layout.tsx`.
- Main shell: `app/(tabs)/` with Overview, Appointments, Reports, More.
- Auth screens: `app/(auth)/login`, `register`, `verify/[emailToken]`.

## Forms

Standard stack (matches pto-tracker-app):

- `useForm` + `zodResolver` + schema in `schemas/`
- `Form` (= `FormProvider`) wrapping fields
- Field components: `form-field-input`, `form-field-select`, `form-field-textarea`, `FormDateField`
- Submit via `form.handleSubmit(mutationFn)`
- Feedback via `useToast` → `react-native-toast-message`
- Data via `@tanstack/react-query` + `api-managers/*`

## Modals & overlays (important)

### Form sheets → use `FormSheetModal`

All **create/edit form flows** use `components/FormSheetModal.jsx`, following **pto-tracker-app** (`NewOffDayDialog`, `NewTrainBookingDialog`):

```jsx
<FormSheetModal
  open={open}
  onOpenChange={onOpenChange}
  title="…"
  footer={<Button onPress={form.handleSubmit(onSave)}>…</Button>}
>
  <Form {...form}>…fields…</Form>
</FormSheetModal>
```

Implementation details:

- React Native `Modal` with `presentationStyle="pageSheet"` and `animationType="slide"`
- `CircleX` close button top-left → calls `onOpenChange(false)`
- Form body in `ScrollView` (`flex-1`, `keyboardShouldPersistTaps="handled"`)
- **Primary action:** `footer` (Save button) **or** `onConfirm` (tick in the sheet header). `NewReportDialog` uses `onConfirm`.
- Optional `appearance="dark"` / `"iosDark"` for the iOS dark sheet (see [THEMING.md](./THEMING.md)). Default is `light`.
- Optional `scrollable={false}` for list-heavy sheets (e.g. `InvestigationSelect`)

**Current consumers:** `NewAppointmentDialog`, `NewReportDialog`, `NewProfileDialog`, `InvestigationSelect`.

### Do not use `@rn-primitives/dialog` for form modals

`components/ui/dialog.tsx` remains in the repo for shadcn/rn-primitives compatibility, but **form dialogs were migrated away** because:

1. **Save button clipping** — `DialogContent` + `max-h-[90%]` + `ScrollView` often hid the bottom submit button; scrolling did not reliably expose it.
2. **Nested overlay conflicts on iOS** — Dialog uses `FullWindowOverlay` from `react-native-screens`. Nesting RN `Modal` or extra portaled overlays (date pickers) inside Dialog caused calendars to render behind the dialog or miss touches.

Use `FormSheetModal` for new form UIs unless there is a strong reason not to.

### Delete / confirm prompts → use `AlertDialog`

Destructive confirmations stay on `components/ui/alert-dialog.tsx` (e.g. `ProfileCard`, `AppointmentCard`, `ReportCard`). These are small, centered prompts—not full-page forms.

### Select dropdowns inside sheets

`form-field-select` uses `@rn-primitives/select` with `FullWindowOverlay`. This works correctly **inside `FormSheetModal`** (page sheet is a single native modal; select portals above it).

## Date picking

Use **`FormDateField`** (`components/FormDateField.jsx`): inline **Accordion + `react-native-calendars`**, same as pto-tracker-app.

```jsx
<FormDateField
  formControl={form.control}
  name="date"
  labelText="Date of appointment"
  minDate="yyyy-MM-dd"   // optional
  maxDate="yyyy-MM-dd"   // optional
/>
```

- Expand accordion → calendar inline in the form (no nested popup).
- On day press: `onChange(new Date(day.dateString))` (prefer `dateString` over `timestamp` for timezone stability).

**Avoid for form dates:**

- RN `Modal` calendar inside `@rn-primitives/dialog` (broken on iOS).
- `@rn-primitives/popover` for calendar inside dialogs (overlay stack issues; popover `open` prop is not fully controlled on native).

`DateRange` (analytics filters) may still use a bottom-sheet `Modal` on full screens where no parent Dialog exists—that pattern is fine outside form sheets.

## Styling

- **NativeWind** `className` on React Native components.
- Theme tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-input`, etc.
- Icons: `lucide-react-native`.
- Charts: `components/charts/*` (react-native-svg), not Recharts.

**Per-subtree appearance (iOS dark opt-in):** see **[THEMING.md](./THEMING.md)**. Do not add `isDark` color branches. Wrap a screen in `ThemeProvider` from `@/components/ThemeProvider` (not `@react-navigation/native`) or pass `appearance` on `FormSheetModal`. Palettes live in `lib/appearance.js`.

## Auth & storage

- Public axios instance: `@/api/axios`
- Authenticated requests: `useAxiosPrivate`
- Tokens: `SecureStore` (native), cookies/localStorage (web) via auth hooks
- Always import as `@/api/axios`, `@/hooks/useAuth` — especially from nested routes like `app/(auth)/verify/[emailToken].jsx` ( `../../api/axios` resolves incorrectly there).

## Directory map (agent quick reference)

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens |
| `api-managers/` | API CRUD hooks (ported from web) |
| `schemas/` | Zod form schemas |
| `components/` | Shared UI; **`FormSheetModal`**, **`FormDateField`**, cards, charts |
| `components/ui/` | rn-primitives wrappers (button, select, alert-dialog, …) |
| `hooks/` | Auth, axios, toast |
| `lib/` | Utilities (`reportUtils`, etc.); **`appearance.js`** palettes for per-subtree theming |
| `constants/` | App constants (e.g. appointment time slots) |
| `docs/migration/` | Phase-by-phase migration plans & parity checklist |

## Deferred / not yet ported

See `docs/migration/phase-4-advanced.md`:

- Report file upload & in-app PDF viewing
- OCR auto-fill from uploaded reports

## Checklist for new form dialogs

1. Create `components/New*Dialog.jsx` using **`FormSheetModal`**, not `Dialog`.
2. Put fields inside `<Form>`, submit button in `footer`.
3. Use **`FormDateField`** for dates (accordion calendar).
4. Use **`form-field-select`** for enums/lists; load options with React Query when needed.
5. Wire `open` / `onOpenChange` from the parent screen.
6. Invalidate relevant query keys on success; toast on success/error.
7. Import shared modules with `@/` paths only.
