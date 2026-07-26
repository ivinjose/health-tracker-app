# Phase 5 — Cleanup, Polish & Hardening

**Goal:** Remove dead code, unify conventions, fix edge cases, and validate across platforms.

**Estimated effort:** 1–2 days

**Prerequisites:** Phases 0–3 complete (Phase 4 optional but note parity gaps in README if skipped).

---

## 5.1 Remove dead code and artifacts

### Delete if still present

| Item | Reason |
|------|--------|
| PTO references (grep entire repo) | Fully replaced |
| `app/modal.tsx` | Expo template leftover if unused |
| `components/ui/hello-wave.tsx` | Template demo |
| `components/ui/parallax-scroll-view.tsx` | Template demo |
| `components/ui/external-link.tsx` | Template demo if unused |
| `scripts/reset-project.js` | Template script if unused |
| `migrate_health-tracker-app.code-workspace` | Stray workspace file |
| `constants/~theme.ts` | Duplicate of `lib/theme.ts` if confirmed |

### Verify PTO removal

```bash
grep -r "OffDay\|TrainBooking\|offday\|trainBooking\|pto" --include="*.{js,jsx,ts,tsx}" .
```

### Remove unused dependencies

From `package.json`, remove if no longer referenced:

- `expo-calendar` (train booking reminders only)

Run dependency audit:

```bash
npx depcheck
```

---

## 5.2 Unify naming conventions

| Inconsistency | Target standard |
|---------------|-----------------|
| Web `apiManagers` vs Expo `api-managers` | `api-managers` |
| Web `pages/` vs Expo `app/` | Routes only in `app/` |
| Component files | PascalCase: `ProfileCard.jsx` |
| Create dialogs | `NewProfileDialog`, `NewAppointmentDialog`, `NewReportDialog` |
| Chart components | `components/charts/` subdirectory |

---

## 5.3 Auth and error handling

- [ ] Remove hardcoded credentials from login
- [ ] 401/403 consistently redirect to login
- [ ] Failed refresh clears auth (`setAuth({})`)
- [ ] Logout clears SecureStore refresh token
- [ ] Consistent error UI on failed queries (not silent `console.log` only)

---

## 5.4 UX polish

| Item | Action |
|------|--------|
| Loading states | Skeleton on every list screen |
| Empty states | Consistent copy + "Add" CTA |
| Safe areas | `useSafeAreaInsets` on dialogs and bottom sheets |
| Keyboard | `KeyboardAvoidingView` on all forms |
| Pull to refresh | `RefreshControl` on list screens |
| Haptics | Optional `expo-haptics` on successful create |
| Dark mode | Verify NativeWind dark classes |

---

## 5.5 Platform testing matrix

Test every screen on:

| Platform | Focus |
|----------|-------|
| iOS Simulator | Layout, calendars, charts, safe areas |
| Android Emulator | API URL (`10.0.2.2`), hardware back button |
| Expo Web | Auth cookies, OCR if Phase 4 web-only |
| Physical device | `EXPO_PUBLIC_API_URL` = LAN IP |

### Screen checklist

- [ ] Login / Register / Verify
- [ ] Overview
- [ ] Appointments (list + create)
- [ ] Reports (list + create)
- [ ] Analyse reports
- [ ] Compare reports
- [ ] Profiles
- [ ] More menu
- [ ] Logout

---

## 5.6 Documentation

Update `README.md` in repo root:

- Project description: health tracker (not PTO)
- Environment: `EXPO_PUBLIC_API_URL`
- Run instructions: `npx expo start`
- Feature parity notes (OCR native status, chart library used)
- Link to `docs/migration/` for historical context

---

## 5.7 Final parity checklist

| Web feature | Expected status |
|-------------|-----------------|
| Login / Register / Verify | ✅ Phase 0 |
| Overview | ✅ Phase 2 + 3 |
| Appointments CRUD | ✅ Phase 2 |
| Reports CRUD | ✅ Phase 2 |
| Report upload / view | ✅ or documented skip — Phase 4 |
| OCR | ✅ web or documented skip — Phase 4 |
| Analyse reports | ✅ Phase 3 |
| Compare reports | ✅ Phase 3 |
| Profiles CRUD | ✅ Phase 2 |
| Sidebar navigation | ✅ Tabs + More — Phase 1 |
| Protected routes | ✅ Phase 0 |
| Token refresh | ✅ Phase 0 |

Mark any ❌ with reason and planned follow-up.

---

## 5.8 Optional improvements (post-MVP)

- EAS Build configuration for App Store / Play Store
- Error boundary component
- Offline indicator
- Biometric login
- Push notifications for appointment reminders

Not required for migration exit — track separately.

---

## Exit criteria

- Production-ready health tracker Expo app
- No PTO remnants
- Consistent code style
- Verified on iOS, Android, and web
- README reflects actual feature set

---

## Migration complete

When all exit criteria are met, the web app (`health-tracker`) can remain as a reference or be archived. The Expo app (`health-tracker-app`) is the primary client going forward.
