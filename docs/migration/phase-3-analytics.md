# Phase 3 — Analytics Screens

**Goal:** Port charting, date filtering, investigation search, and the analyse/compare user flows.

**Estimated effort:** 2–4 days

**Prerequisites:** [Phase 2 complete](./phase-2-core-crud.md) — reports and investigations data should exist to chart.

**Next phase:** [phase-4-advanced.md](./phase-4-advanced.md)

---

## 3.1 Choose and install chart library

Web uses **Recharts** (DOM/SVG — does not run on React Native).

### Options

| Library | Pros | Cons |
|---------|------|------|
| `victory-native` | Mature, SVG, good line charts | Heavier setup |
| `react-native-gifted-charts` | Simple API | Less customizable |
| `react-native-chart-kit` | Easy start | Less maintained |

### Install (example: victory-native)

```bash
npx expo install victory-native react-native-svg
```

Document your choice in the repo README when implemented.

---

## 3.2 Port chart components

| Web source | Expo target | Used by |
|------------|-------------|---------|
| `src/components/Charts/LineChart.jsx` | `components/charts/LineChart.jsx` | Analyse, HealthGraph |
| `src/components/Charts/CompareChart.jsx` | `components/charts/CompareChart.jsx` | CompareGraph |
| `src/components/Charts/OverlappingLineChart.jsx` | `components/charts/OverlappingLineChart.jsx` | CompareGraph |
| `src/components/Widgets/HealthGraph/HealthGraph.jsx` | `components/widgets/HealthGraph.jsx` | Overview |
| `src/components/CompareGraph/CompareGraph.jsx` | `components/CompareGraph.jsx` | ComparePage |

### Porting approach

1. Keep the same props where possible (`data`, `xAxisKey`, `yAxisKey`)
2. Replace Recharts primitives with your chosen library
3. Keep `date-fns` `format()` for axis labels
4. Wrap charts in a fixed-height `View` (RN requires explicit dimensions)

**Do not port:** `src/components/ui/chart.tsx` (Recharts-specific shadcn wrapper)

---

## 3.3 Port DateRange

### Web source

- `health-tracker/src/components/DateRange/DateRange.jsx`

### Expo target

- `components/DateRange.jsx`

### Logic to preserve

- Toggle enable/disable for from-date and to-date
- When disabled, call reset callbacks (`onFromDateReset`, `onToDateReset`)
- Pass selected dates to parent via `onFromDateSelect`, `onToDateSelect`

### UI adaptation

| Web | Expo |
|-----|------|
| Radix Popover | Modal or inline panel |
| react-day-picker | `react-native-calendars` |
| Checkbox toggles | `components/ui/checkbox.tsx` from Phase 1 |

---

## 3.4 Port investigation picker (AutoComplete)

### Web source

- `health-tracker/src/components/AutoComplete/AutoComplete.jsx` (uses `cmdk`)

### Expo target

- `components/InvestigationSelect.jsx`

**Do not port `cmdk`.** Build a searchable select:

- **Option A:** Modal with `TextInput` + filtered `FlatList`
- **Option B:** Extend `form-field-select` with filter input above options
- **Option C:** `@rn-primitives/select` with search if supported

### Props to preserve

- `results` — `{ value, label }[]`
- `currentValue`
- `onSelectCb`
- `labelText`

---

## 3.5 Analyse Reports

### Web source

- `health-tracker/src/pages/AnalyseReportsPage/AnalyseReportsPage.jsx`

### Expo targets

- `app/(tabs)/more/analyse-reports/index.jsx`
- `app/(tabs)/more/analyse-reports/[investigation].jsx`

### Logic to preserve

- Params: `investigation`, `from`, `to` via `useLocalSearchParams()`
- `InvestigationsApiManager.readInvestigations()` for dropdown data
- `ReportsApiManager.readReports({ investigation, from, to })` for chart + list
- On investigation change: `router.push` with updated param

### Layout

1. Top: `InvestigationSelect` + `DateRange`
2. Middle: `LineChart`
3. Bottom: scrollable `ReportCard` list

---

## 3.6 Compare Reports

### Web source

- `health-tracker/src/pages/ComparePage/ComparePage.jsx`

### Expo target

- `app/(tabs)/more/compare.jsx`

### Logic to preserve

- Two investigation selectors (`investigation1`, `investigation2`) in search params
- `DateRange` filters
- `ReportsApiManager.compareReports({ investigation1, investigation2, from, to })`
- `CompareGraph` with overlapping lines

---

## 3.7 Complete Overview widgets

Return to `app/(tabs)/index.jsx`:

- Replace HealthGraph placeholders with real widgets
- Match web investigations (e.g. `hba1c`, `t4`) and `count` props

---

## 3.8 More menu hub

### Expo target

- `app/(tabs)/more/index.jsx`

Menu items (mirror web sidebar items not in main tabs):

| Label | Route |
|-------|-------|
| Analyse reports | `/(tabs)/more/analyse-reports` |
| Compare reports | `/(tabs)/more/compare` |
| Profiles | `/(tabs)/more/profiles` |
| User / active profile | Inline or link to profiles |

Include `components/User.jsx` for profile context.

---

## Suggested order of work

1. Install chart library + port `LineChart`
2. `DateRange` + `InvestigationSelect`
3. Analyse reports screens
4. Compare screen + `CompareGraph`
5. Overview HealthGraph widgets
6. More menu hub

---

## Testing checklist

- [ ] Line chart renders with real report data
- [ ] Compare chart shows two investigations
- [ ] Date range filters update chart and list
- [ ] Investigation select search/filter works
- [ ] Route `analyse-reports/[investigation]` works (e.g. hba1c)
- [ ] Overview HealthGraph widgets show charts
- [ ] Charts work on iOS and Android (note web behavior if library differs)
- [ ] Empty state when no data in selected range

---

## Exit criteria

Full analytics parity with web except PDF/OCR. User can analyse and compare health metrics over time.
