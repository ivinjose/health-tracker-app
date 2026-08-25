# Appearance theming

Reference for humans and coding agents working on **app-wide appearance** in health-tracker-app.

This is **not** OS/system dark mode and **not** a user-facing light/dark toggle. The whole app uses one explicit palette (`APP_APPEARANCE`, currently `dark`). Child components do not check `isDark`. They use the same NativeWind class names and the same `useTheme()` fields everywhere; the root provider remaps what those tokens mean.

Related: [ARCHITECTURE.md](../ARCHITECTURE.md) (structure, auth, forms, navigation). This file is the source of truth for colors and appearance.

---

## Why this exists

Early iOS-dark work branched in every leaf (`isDark ? 'bg-[#2C2C2E]' : 'bg-card'`), then wrapped individual screens. That does not scale.

The replacement is:

1. One palette dictionary per appearance in `lib/appearance.js`.
2. `APP_APPEARANCE` as the single switch (`'dark'` today).
3. One `ThemeProvider` at the app root that sets React context **and** NativeWind CSS variables.
4. Leaves always use semantic classes (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `text-destructive`, `border-input`, `bg-primary`).
5. `useTheme()` only for React Native props that cannot take a `className` (placeholder color, keyboard, calendar theme, lucide `color`, `RefreshControl` tint, SVG strokes).

There is **no** `isDark` / `appearance === 'dark'` branch in leaf UI. The only remaining appearance-driven **structure** branch is in `components/FormSheetModal.jsx` (`theme.layout.header === 'toolbar'` vs stacked title).

Do **not** wrap individual screens in `ThemeProvider`. Re-apply vars only on native `Modal` windows and portal roots.

---

## What this is not

Do not confuse these three separate systems:

| System | File | What it does |
|--------|------|----------------|
| **Appearance theming (this doc)** | `lib/appearance.js`, `components/ThemeProvider.jsx` | Explicit `light` / `dark` palettes; app-wide via `APP_APPEARANCE` |
| **React Navigation theme** | `app/_layout.tsx` imports `ThemeProvider as NavigationThemeProvider` from `@react-navigation/native` | Aligned to `APP_APPEARANCE` (`DarkTheme` + `theme.reactNavigation.colors`). Does **not** follow OS `useColorScheme()` |
| **Expo template color scheme** | `lib/theme.ts` `Colors`, `hooks/use-theme-color.ts`, `hooks/use-color-scheme.ts` | Legacy template lookup. Do **not** use for this appearance system |

`global.css` still defines `:root` and `.dark` CSS variables (shadcn-style). Appearance theming **does not** toggle the `.dark` class. The `dark` palette is not the same as those unused `.dark` tokens (see palettes below). Tailwind `dark:` variants follow NativeWind/system color scheme, not `ThemeProvider`. Do not use `dark:` to implement this appearance system.

Root `StatusBar` in `app/_layout.tsx` uses `getAppearance(APP_APPEARANCE).statusBarStyle`. Screens should not mount their own `StatusBar` except inside a `Modal` (form sheets).

---

## Core files

| Path | Role |
|------|------|
| `lib/appearance.js` | Palettes, `APP_APPEARANCE`, `vars()`, derived bags (`calendar`, `navigation`, `reactNavigation`, `chart`, `layout`), `getAppearance`, `resolveAppearanceName`, `appearances` |
| `components/ThemeProvider.jsx` | Context + wrapper Views that apply `theme.vars`. Mounted once in `app/_layout.tsx` |
| `app/_layout.tsx` | Root appearance provider, navigation theme, root `StatusBar`, `Toast` inside the appearance tree |
| `app/(tabs)/_layout.tsx` | Spreads `getAppearance(APP_APPEARANCE).navigation` on `Tabs` `screenOptions` |
| `app/(tabs)/more/_layout.tsx` | Same header colors on the More stack |
| `tailwind.config.js` | Maps NativeWind colors to `hsl(var(--background))` etc. |
| `global.css` | Default `:root` (and unused-by-this-system `.dark`) channel values |
| `components/FormSheetModal.jsx` | Sheet: reads `useTheme()`, re-applies vars inside the RN `Modal` |

---

## Palettes

Defined as `PALETTES.light` and `PALETTES.dark` in `lib/appearance.js`. Each palette has:

- `colors` — hex strings for RN props
- `channels` — space-separated HSL **without** `hsl()`, matching `global.css` / `hsl(var(--token))`
- `keyboardAppearance` — `'light'` or `'dark'` (passed to `TextInput`)
- `statusBarStyle` — `'dark'` or `'light'` (passed to `expo-status-bar` `StatusBar` `style`)
- `userInterfaceStyle` — `'light'` or `'dark'` (passed to RN `Modal` on iOS)
- `layout` — sheet chrome/padding (consumed only by `FormSheetModal`)
- `chart` — `{ line, lineSecondary, axis, label }` hex for `LineChart` / `CompareChart`

`APP_APPEARANCE` is `'dark'`. Changing that constant (and aligning `app.json` `userInterfaceStyle` if needed) is how you switch the whole app. There is no per-screen opt-in.

### `light`

Matches the app’s default shadcn-like tokens (near-black primary, white backgrounds). Kept so palettes stay complete; it is **not** the live app appearance.

Notable `colors` values from code:

- `background` / `popover`: `#ffffff`
- `card`: `#F2F2F7` (iOS grouped gray so cards read against the white page)
- `foreground`: `#0a0a0a`
- `primary`: `#171717`, `primaryForeground`: `#fafafa`
- `mutedForeground`: `#737373`
- `destructive`: `#ef4444`
- `placeholder`: `#9ca3af`
- `tint`: `#007AFF` (iOS system blue, light)
- `tintDisabled`: `#9ca3af`
- `close`: `#4c4c4c`

`layout.header` is `'stacked'`. Padding: `contentPadding: 40`, `contentPaddingTopWithTitle: 16`, `contentPaddingTopWithoutTitle: 56`.

`chart`: `line: '#30425f'`, `lineSecondary: '#e54d2e'`, `axis: '#b8c0d9'`, `label: '#6b7280'`.

### `dark`

iOS grouped dark, not shadcn `.dark` (shadcn dark uses near-black background and **white** primary; this palette uses charcoal surfaces and **blue** primary).

Notable `colors` values from code:

- `background`: `#1C1C1E`
- `card` / `popover` / `secondary` / `muted` / `input`: `#2C2C2E`
- `foreground` / `cardForeground` / `primaryForeground`: `#FFFFFF`
- `primary` / `tint`: `#0A84FF`
- `mutedForeground` / `placeholder` / `close`: `#8E8E93`
- `accent` / `border`: `#3A3A3C`
- `destructive`: `#FF453A`
- `tintDisabled`: `#636366`

`layout.header` is `'toolbar'`. Padding: `contentPadding: 20`, both top paddings `8`.

`chart`: `line: '#0A84FF'`, `lineSecondary: '#FF453A'`, `axis: '#3A3A3C'`, `label: '#8E8E93'`.

Because `--primary` is remapped to `#0A84FF`, default `Button` (`bg-primary`) is the blue CTA without extra hex class names.

---

## Resolved theme object

`getAppearance(name)` returns a cached object:

```js
{
  name,                 // 'light' | 'dark'
  colors,               // hex dictionary above
  vars,                 // NativeWind vars(channels) style object
  calendar,             // react-native-calendars theme (from toCalendar(colors))
  keyboardAppearance,
  statusBarStyle,
  userInterfaceStyle,
  layout,
  navigation,           // React Navigation header + tabBar options (from toNavigation(colors))
  reactNavigation,      // { dark, colors } overlay for @react-navigation/native ThemeProvider
  chart,
}
```

`resolveAppearanceName(name)`:

- `'light'` and `'dark'` pass through
- default / unknown / missing → `APP_APPEARANCE`

`appearances.light` and `appearances.dark` are pre-built for call sites that need the object without a hook (layouts use `getAppearance(APP_APPEARANCE)`).

`getAppearance` caches by resolved name so `vars()` is not rebuilt every render.

`toCalendar(colors)` maps:

- calendar backgrounds → `colors.background`
- selected/today/arrows → `colors.tint`
- day/month text → `colors.foreground`
- section titles → `colors.mutedForeground`
- disabled → `colors.tintDisabled`
- selected day text → `colors.primaryForeground`

`toNavigation(colors)` maps:

- `headerStyle.backgroundColor` → `colors.background`
- `headerTintColor` / `headerTitleStyle.color` → `colors.foreground`
- `headerShadowVisible: false`
- `tabBarStyle.backgroundColor` → `colors.background`
- `tabBarStyle.borderTopColor` → `colors.border`
- `tabBarActiveTintColor` → `colors.tint`
- `tabBarInactiveTintColor` → `colors.mutedForeground`

`toReactNavigation(colors, userInterfaceStyle)` maps navigator theme colors: `primary` ← tint, `background`/`card` ← background, `text` ← foreground, `border` ← border, `notification` ← destructive, `dark` ← `userInterfaceStyle === 'dark'`.

---

## ThemeProvider

Mounted once in `app/_layout.tsx`:

```jsx
<ThemeProvider appearance={APP_APPEARANCE} className="flex-1 bg-background">
  {children}
</ThemeProvider>
```

Implementation details that matter:

- Default context value is `getAppearance(APP_APPEARANCE)`.
- `appearance` is passed to `getAppearance` (so `'dark'` is valid if you nest a provider).
- **Two nested `View`s:** outer `style={[theme.vars, style]}` `className="flex-1"`; inner `className={className ?? 'flex-1'}`. CSS variables are applied on the **parent** of `bg-background` so NativeWind `hsl(var(--background))` resolves to the remapped channels. Putting `vars` and `bg-background` on the same node is unreliable.
- `useTheme()` is `useContext(ThemeContext)`.

`useTheme()` from this file is **not** `hooks/use-theme-color.ts` (`useThemeColor`). Import from `@/components/ThemeProvider`.

Do not wrap screens. Nested `ThemeProvider` is only for **new native windows** (`Modal`), where NativeWind `vars()` do not inherit.

Name collision: `app/_layout.tsx` aliases `@react-navigation/native` as `NavigationThemeProvider`.

---

## NativeWind token wiring

`tailwind.config.js` `theme.extend.colors`:

- `background` → `hsl(var(--background))`
- `foreground` → `hsl(var(--foreground))`
- `card` / `card.foreground`
- `popover` / `popover.foreground`
- `primary` / `primary.foreground`
- `secondary` / `secondary.foreground`
- `muted` / `muted.foreground`
- `accent` / `accent.foreground`
- `destructive` / `destructive.foreground`
- `border`, `input`, `ring`

`lib/appearance.js` `channels` keys are those same CSS variables (`--background`, `--primary`, …). `vars()` from `nativewind` (re-exported from `react-native-css-interop`) injects them as a style object.

Default `:root` in `global.css` matches `PALETTES.light.channels`. The live app does not rely on `:root` because the root `ThemeProvider` remaps channels to `APP_APPEARANCE`.

---

## `useTheme()` — RN-only props

Use context hex/enums only where `className` cannot be used. Current call sites:

| Consumer | Fields used |
|----------|-------------|
| `form-field-input.jsx` | `colors.placeholder`, `keyboardAppearance`, `colors.tint` (`selectionColor`) |
| `form-field-textarea.jsx` | same |
| `InvestigationSelect.jsx` | same |
| `FormDateField.jsx` | `colors.tint` (calendar icon) |
| `DatePickerCalendar.jsx` | `calendar`, `colors.background` (`Calendar` `style`), `colors.tint` / `tintDisabled` / `foreground` / `primaryForeground` (year picker) |
| `DateRange.jsx` | `colors.mutedForeground`; nested `ThemeProvider` inside calendar `Modal` |
| `CardView.jsx` | `colors.mutedForeground` (ellipsis icon) |
| `ReportCard.jsx` | `colors.primary` (`CircleUserRound`) |
| `AppointmentCard.jsx` / `ProfileCard.jsx` / `AppointmentsWidget.jsx` | `colors.primary` (icons) |
| `HealthGraph.jsx` | `colors.primary` (`ArrowRight`) |
| `LineChart.jsx` | `chart.line`, `chart.axis`, `chart.label` |
| `CompareChart.jsx` | `chart.line`, `chart.lineSecondary`, `chart.axis`, `chart.label` |
| `reports.jsx` / `appointments.jsx` / `profiles.jsx` | `colors.primaryForeground` (Plus), `colors.mutedForeground` / `colors.tint` (`RefreshControl`) |
| `login.jsx` / `register.jsx` | `colors.placeholder`, `keyboardAppearance`, `colors.tint`, `colors.primaryForeground` (spinner); register also `colors.tint` / `colors.destructive` for validation icons |
| `FormSheetModal.jsx` `FormSheetBody` | `colors.close`, `colors.tint`, `colors.tintDisabled`, `layout.*` |
| `select.tsx` `SelectContent` | `vars` on portal root only |
| `dropdown-menu.tsx` `DropdownMenuContent` / `DropdownMenuSubContent` | `vars` on portal roots |
| `alert-dialog.tsx` `AlertDialogContent` | `vars` on portal root only |

Do **not** add `if (theme.name === 'dark')` in these files. If a color is wrong, change the palette.

---

## Portals

NativeWind `vars()` is a native **style**, not React context. It does not follow `@rn-primitives` portals / `FullWindowOverlay`.

React context **does** follow portals. So `SelectContent`, `DropdownMenuContent`, `DropdownMenuSubContent`, and `AlertDialogContent` call `useTheme()` and wrap the portaled tree in `<View style={theme.vars}>`, then keep using `bg-popover`, `border-border`, `text-popover-foreground`, `bg-background`.

If you add a new portaled overlay that uses semantic color classes, re-apply `theme.vars` on that portal root the same way. Skipping this makes the overlay use `:root` (light) even when the app is `dark`.

---

## Form sheets and other Modals

A RN `Modal` is a new native window, so it cannot inherit NativeWind vars from the root wrapper. React context **does** follow.

`FormSheetModal` therefore:

1. `useTheme()` from the root provider (for `Modal` `userInterfaceStyle` and `StatusBar`).
2. Spreads `userInterfaceStyle` onto `Modal` when the theme has one.
3. Renders `<StatusBar style={theme.statusBarStyle} />` inside the modal.
4. Wraps body in `<ThemeProvider appearance={theme.name} className="flex-1 bg-background">` so vars apply inside the new window.

Do not pass an `appearance` prop. Sheets follow `APP_APPEARANCE`.

`DateRange` calendar is also a `Modal`; it nests `ThemeProvider appearance={theme.name}` the same way. The calendar grid itself is `DatePickerCalendar`, which reads `theme.calendar`.

`FormSheetBody` (inside the provider) is the only place allowed to branch on **layout**:

- `theme.layout.header === 'toolbar'` (`dark`): row with `CircleX` | centered title | optional `CircleCheck` confirm (or an empty `h-8 w-8` spacer if no `onConfirm`).
- else (`light`): absolute `CircleX` top-left, optional confirm top-right, title below (`px-10 pt-14`).

Confirm control: `onConfirm` + `confirmDisabled` / `confirmLoading`. Loading shows `ActivityIndicator` with `theme.colors.tint`. Inactive confirm uses `theme.colors.tintDisabled`. `NewReportDialog` uses this instead of a footer Save button. Sheets that still pass `footer` keep the footer `View` (`px-10 p-4`).

Scroll padding comes from `theme.layout.contentPadding` and the title-aware top padding fields.

---

## Navigation chrome

Tab **header** and **tab bar** are not inside screen views. `app/(tabs)/_layout.tsx` puts `...getAppearance(APP_APPEARANCE).navigation` on `Tabs` `screenOptions` so every tab (including hidden Appointments, More, Logout) shares header/tab-bar colors.

`app/(tabs)/more/_layout.tsx` applies the same `headerStyle` / `headerTintColor` / `headerTitleStyle` / `headerShadowVisible` on the More stack.

Auth stack (`app/(auth)/_layout.jsx`) has `headerShown: false`.

`app/_layout.tsx` aligns `@react-navigation/native` with `DarkTheme` + `appTheme.reactNavigation.colors` so navigator defaults match the palette even where a screen does not set options.

---

## Shared components — expected classes

These already use semantic tokens. Prefer extending them over adding hex.

**Form fields** (`form-field-input`, `form-field-textarea`): label `text-sm font-medium text-muted-foreground`; control `rounded-[10px] border border-input bg-card … text-foreground`; errors `text-destructive`. Select trigger adds `bg-card`. Date trigger: `rounded-[10px] border border-input bg-card`.

**Cards:** `CardView` is `rounded-[10px] bg-card`. Menu labels `text-popover-foreground` or `text-destructive`. `WidgetView` is `rounded-lg border border-border bg-card` with `bg-muted/30` header.

**Buttons:** default variant is enough for the blue CTA; screens add `h-11 rounded-[10px] shadow-none` where they want the taller iOS-like control. Lucide icons on those buttons use `theme.colors.primaryForeground`, not a hardcoded `#fff`.

**Links / accent icons:** `text-primary` and `theme.colors.primary` (not `#30425f`).

**Destructive confirm:** `ReportCard` passes `className="bg-destructive"` on `AlertDialogAction` (not appearance-specific).

---

## How to add a new screen

1. Use semantic classes (`bg-background`, `text-foreground`, `bg-card`, …). Do **not** wrap the screen in `ThemeProvider`.
2. Call `useTheme()` only for RN props CSS cannot style.
3. For `TextInput`: `placeholderTextColor={theme.colors.placeholder}`, `keyboardAppearance={theme.keyboardAppearance}`, `selectionColor={theme.colors.tint}`.
4. For lucide `color` props: `theme.colors.primary`, `theme.colors.tint`, `theme.colors.mutedForeground`, `theme.colors.destructive`, `theme.colors.close`, `theme.colors.primaryForeground` as appropriate.
5. Any new portal: wrap with `style={theme.vars}`.
6. Any new RN `Modal`: nest `<ThemeProvider appearance={theme.name} className="flex-1 bg-background">` (or `View style={theme.vars}`) inside the modal.

---

## How to add or change a palette

Edit `PALETTES` in `lib/appearance.js` only.

- Hex in `colors` (RN props, navigation, calendar, charts).
- Matching HSL channels in `channels` (must stay in sync with `colors` or class names and RN props will disagree).
- Channel format: `'211 100% 52%'` — no `hsl()`, same as `global.css`.
- If you add a Tailwind color, add it to `tailwind.config.js` **and** to every palette’s `channels`.
- To switch the live app, change `APP_APPEARANCE` (and `app.json` `userInterfaceStyle` if the new palette’s `userInterfaceStyle` differs).
- Keep `resolveAppearanceName` aliases documented if you add more.

Do not copy hex into screen files.

---

## Rules for agents

**Do**

- Set appearance once at the root (`APP_APPEARANCE` + `ThemeProvider` in `app/_layout.tsx`).
- Use semantic NativeWind classes in leaves.
- Re-apply `theme.vars` on new portal roots and inside `Modal`.
- Use `useTheme()` only for props CSS cannot style.

**Do not**

- Wrap individual screens in `ThemeProvider`.
- Add `isDark ? … : …` color branches in cards, fields, charts, or screens.
- Use Tailwind `dark:` for this system.
- Import `ThemeProvider` from `@react-navigation/native` when you meant `@/components/ThemeProvider`.
- Use `hooks/use-theme-color.ts` or `Colors[colorScheme]` for these palettes.
- Pass `appearance` on `FormSheetModal`.
- Put `bg-background` on the same `View` as `style={theme.vars}` and expect the background to use the remapped token (use the two-layer wrapper `ThemeProvider` already has).
