# Health Tracker Migration Plans

Migrate features from **health-tracker** (Vite web app) into **health-tracker-app** (Expo app).

**Status: Migration complete (Phases 0–3, 5). Phase 4 (PDF/OCR) deferred.**

## How to use these plans

Work through phases in order. Each file is self-contained with goals, tasks, file paths, testing checklists, and exit criteria.

| Phase | File | Focus | Est. effort |
|-------|------|-------|-------------|
| 0 | [phase-0-prep.md](./phase-0-prep.md) | Strip PTO, complete auth, project setup | 2–4 hours |
| 1 | [phase-1-foundation.md](./phase-1-foundation.md) | API managers, schemas, navigation skeleton | 4–6 hours |
| 2 | [phase-2-core-crud.md](./phase-2-core-crud.md) | Profiles, Appointments, Reports, Overview | 2–3 days |
| 3 | [phase-3-analytics.md](./phase-3-analytics.md) | Charts, Analyse, Compare, DateRange | 2–4 days |
| 4 | [phase-4-advanced.md](./phase-4-advanced.md) | PDF, upload, OCR | 2–5 days (deferrable) |
| 5 | [phase-5-cleanup.md](./phase-5-cleanup.md) | Remove dead code, polish, cross-platform QA | 1–2 days |

**Total estimate:** ~1.5–3 weeks depending on chart library choice and OCR decisions.

## Source and target repos

| | Path | Stack |
|---|------|-------|
| **Source (web)** | `../health-tracker` | Vite, react-router-dom, CSS Modules, Radix web |
| **Target (Expo)** | `.` (this repo) | Expo Router, NativeWind, @rn-primitives |

## Migration principle

**Port logic, rebuild UI.** API managers, schemas, and React Query patterns copy with minimal edits. Pages, layout, and web-only libraries (Recharts, react-pdf, tesseract.js) must be reimplemented for React Native.

## Reference pattern for UI ports

See **[../ARCHITECTURE.md](../ARCHITECTURE.md)** for full agent context (modals, date pickers, imports, repo relationships).

Summary:

- `useForm` + `zodResolver` + `@tanstack/react-query`
- **`FormSheetModal`** for form dialogs (pattern from `pto-tracker-app`; not `@rn-primitives/dialog`)
- `FormDateField` (accordion + calendar), `form-field-input`, `form-field-select`, `form-field-textarea`
- `useToast` + `react-native-toast-message`
- NativeWind `className` on RN components; `@/` import alias

## Parity checklist (final state)

| Web feature | Phase |
|-------------|-------|
| Login / Register / Verify | 0 |
| Overview | 2 + 3 |
| Appointments CRUD | 2 |
| Reports CRUD | 2 |
| Report upload / view | 4 (deferred) |
| OCR | 4 (deferred) |
| Analyse reports | 3 |
| Compare reports | 3 |
| Profiles CRUD | 2 |
| Sidebar → tabs + More menu | 1 |
| Protected routes | 0 |
| Token refresh | 0 |
