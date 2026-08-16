# Appearance theming

Reference for humans and coding agents working on **per-subtree appearance** in health-tracker-app.

This is **not** OS/system dark mode. It is an explicit palette applied at a screen or sheet boundary. Child components do not check `isDark`. They use the same NativeWind class names and the same `useTheme()` fields everywhere; the boundary remaps what those tokens mean.

Related: [ARCHITECTURE.md](./ARCHITECTURE.md) (modals, forms, navigation). This file is the source of truth for colors and appearance.

---

## Why this exists

Early iOS-dark work branched in every leaf (`isDark ? 'bg-[#2C2C2E]' : 'bg-card'`). That does not scale: a color tweak or a new screen meant hunting ternaries in form fields, cards, selects, and charts.

The replacement is:

1. One palette dictionary per appearance in `lib/appearance.js`.
2. A `ThemeProvider` that sets React context **and** NativeWind CSS variables on a wrapper `View`.
3. Leaves always use semantic classes (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `text-destructive`, `border-input`, `bg-primary`).
4. `useTheme()` only for React Native props that cannot take a `className` (placeholder color, keyboard, calendar theme, lucide `color`, `RefreshControl` tint, SVG strokes).

There is **no** `isDark` / `appearance === 'dark'` branch in leaf UI as of this writing. The only remaining appearance-driven **structure** branch is in `components/FormSheetModal.jsx` (`theme.layout.header === 'toolbar'` vs stacked title).

---

## What this is not

Do not confuse these three separate systems:

| System | File | What it does |
|--------|------|----------------|
| **Appearance theming (this doc)** | `lib/appearance.js`, `components/ThemeProvider.jsx` | Explicit `light` / `iosDark` palettes on a subtree |
| **React Navigation theme** | `app/_layout.tsx` imports `ThemeProvider` from `@react-navigation/native` | `DarkTheme` vs `DefaultTheme` from `useColorScheme()` for navigator chrome defaults |
| **Expo template color scheme** | `lib/theme.ts` `Colors`, `hooks/use-theme-color.ts`, `hooks/use-color-scheme.ts` | System light/dark lookup used by tab `screenOptions.tabBarActiveTintColor` fallback (`Colors[colorScheme ?? 'light'].tint`) |

`global.css` still defines `:root` and `.dark` CSS variables (shadcn-style). Appearance theming **does not** toggle the `.dark` class. `iosDark` is a different palette from `.dark` (see palettes below). Tailwind `dark:` variants follow NativeWind/system color scheme, not `ThemeProvider`. Do not use `dark:` to implement this appearance system.

`app/_layout.tsx` still renders `<StatusBar style="auto" />` at the root. Screens that opt into `iosDark` mount their own `expo-status-bar` `StatusBar` with `style={theme.statusBarStyle}` (and Overview/Reports only while `useIsFocused()` is true).

---

## Core files

| Path | Role |
|------|------|
| `lib/appearance.js` | Palettes, `vars()`, derived bags (`calendar`, `navigation`, `chart`, `layout`), `getAppearance`, `resolveAppearanceName`, `appearances` |
| `components/ThemeProvider.jsx` | Context + wrapper Views that apply `theme.vars` |
| `tailwind.config.js` | Maps NativeWind colors to `hsl(var(--background))` etc. |
| `global.css` | Default `:root` (and unused-by-this-system `.dark`) channel values |
| `components/FormSheetModal.jsx` | Sheet boundary: `appearance` prop, Modal `userInterfaceStyle`, nested `ThemeProvider` |
| `app/(tabs)/_layout.tsx` | Spreads `appearances.iosDark.navigation` onto Overview and Reports tab screens |

---

## Palettes

Defined as `PALETTES.light` and `PALETTES.iosDark` in `lib/appearance.js`. Each palette has:

- `colors` — hex strings for RN props
- `channels` — space-separated HSL **without** `hsl()`, matching `global.css` / `hsl(var(--token))`
- `keyboardAppearance` — `'light'` or `'dark'` (passed to `TextInput`)
- `statusBarStyle` — `'dark'` or `'light'` (passed to `expo-status-bar` `StatusBar` `style`)
- `userInterfaceStyle` — `'light'` or `'dark'` (passed to RN `Modal` on iOS)
- `layout` — sheet chrome/padding (consumed only by `FormSheetModal`)
- `chart` — `{ line, axis, label }` hex for `components/charts/LineChart.jsx`

### `light`

Matches the app’s default shadcn-like tokens (near-black primary, white backgrounds).

Notable `colors` values from code:

- `background` / `card` / `popover`: `#ffffff`
- `foreground`: `#0a0a0a`
- `primary`: `#171717`, `primaryForeground`: `#fafafa`
- `mutedForeground`: `#737373`
- `destructive`: `#ef4444`
- `placeholder`: `#9ca3af`
- `tint`: `#007AFF` (iOS system blue, light)
- `tintDisabled`: `#9ca3af`
- `close`: `#4c4c4c`

`layout.header` is `'stacked'`. Padding: `contentPadding: 40`, `contentPaddingTopWithTitle: 16`, `contentPaddingTopWithoutTitle: 56`.

`chart`: `line: '#30425f'`, `axis: '#b8c0d9'`, `label: '#6b7280'` (same hex `LineChart` used before theming, so analyse-reports stays visually unchanged when it is **not** wrapped in `iosDark`).

### `iosDark`

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

`chart`: `line: '#0A84FF'`, `axis: '#3A3A3C'`, `label: '#8E8E93'`.

Because `--primary` is remapped to `#0A84FF`, default `Button` (`bg-primary`) becomes the blue CTA on `iosDark` screens without extra hex class names.

---

## Resolved theme object

`getAppearance(name)` returns a cached object:

```js
{
  name,                 // 'light' | 'iosDark'
  colors,               // hex dictionary above
  vars,                 // NativeWind vars(channels) style object
  calendar,             // react-native-calendars theme (from toCalendar(colors))
  keyboardAppearance,
  statusBarStyle,
  userInterfaceStyle,
  layout,
  navigation,           // React Navigation header + tabBar options (from toNavigation(colors))
  chart,
}
```

`resolveAppearanceName(name)`:

- `'dark'` → `'iosDark'` (so `FormSheetModal appearance="dark"` in `NewReportDialog.jsx` works)
- unknown / missing → `'light'`
- `'light'` and `'iosDark'` pass through

`appearances.light` and `appearances.iosDark` are pre-built for call sites that need the object without a provider (today: `app/(tabs)/_layout.tsx`).

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

---

## ThemeProvider

`components/ThemeProvider.jsx`:

```jsx
<ThemeProvider appearance="iosDark" className="flex-1 bg-background">
  {children}
</ThemeProvider>
```

Implementation details that matter:

- Default context value is `getAppearance('light')`. Any component that calls `useTheme()` **outside** a provider still gets the light palette (this is how `LineChart` on analyse-reports and `AlertDialog` on appointment/profile cards stay light).
- `appearance` is passed to `getAppearance` (so `'dark'` is valid here too).
- **Two nested `View`s:** outer `style={[theme.vars, style]}` `className="flex-1"`; inner `className={className ?? 'flex-1'}`. CSS variables are applied on the **parent** of `bg-background` so NativeWind `hsl(var(--background))` resolves to the remapped channels. Putting `vars` and `bg-background` on the same node is unreliable.
- `useTheme()` is `useContext(ThemeContext)`.

`useTheme()` from this file is **not** `hooks/use-theme-color.ts` (`useThemeColor`). Import from `@/components/ThemeProvider`.

Because `ThemeProvider` always renders a wrapping `View`, it is a layout node (`flex-1`). Screens that use it as the root should pass `className="flex-1 bg-background"` as Overview, Reports, Login, and Register do.

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

Default `:root` in `global.css` matches `PALETTES.light.channels` (light primary `0 0% 9%`, etc.). Unwrapped screens therefore look like `light` even without a provider, as long as they use these class names and not hardcoded hex.

---

## `useTheme()` — RN-only props

Use context hex/enums only where `className` cannot be used. Current call sites:

| Consumer | Fields used |
|----------|-------------|
| `form-field-input.jsx` | `colors.placeholder`, `keyboardAppearance`, `colors.tint` (`selectionColor`) |
| `form-field-textarea.jsx` | same |
| `FormDateField.jsx` | `colors.tint` (calendar icon), `calendar`, `colors.background` (Calendar `style`) |
| `CardView.jsx` | `colors.mutedForeground` (ellipsis icon) |
| `ReportCard.jsx` | `colors.primary` (`CircleUserRound`) |
| `HealthGraph.jsx` | `colors.primary` (`ArrowRight`) |
| `LineChart.jsx` | `chart.line`, `chart.axis`, `chart.label` |
| `reports.jsx` | `statusBarStyle`, `colors.primaryForeground` (Plus icon), `colors.mutedForeground` / `colors.tint` (`RefreshControl`) |
| `login.jsx` / `register.jsx` | `statusBarStyle`, `colors.placeholder`, `keyboardAppearance`, `colors.tint`, `colors.primaryForeground` (spinner); register also `colors.tint` / `colors.destructive` for validation icons and `CircleCheckBig` |
| `FormSheetModal.jsx` `FormSheetBody` | `colors.close`, `colors.tint`, `colors.tintDisabled`, `layout.*` |
| `select.tsx` `SelectContent` | `vars` on portal root only |
| `dropdown-menu.tsx` `DropdownMenuContent` | `vars` on portal root only |
| `alert-dialog.tsx` `AlertDialogContent` | `vars` on portal root only |

Do **not** add `if (theme.name === 'iosDark')` in these files. If a color is wrong, change the palette.

---

## Portals

NativeWind `vars()` is a native **style**, not React context. It does not follow `@rn-primitives` portals / `FullWindowOverlay`.

React context **does** follow portals. So `SelectContent`, `DropdownMenuContent`, and `AlertDialogContent` call `useTheme()` and wrap the portaled tree in `<View style={theme.vars}>`, then keep using `bg-popover`, `border-border`, `text-popover-foreground`, `bg-background`.

If you add a new portaled overlay that uses semantic color classes, re-apply `theme.vars` on that portal root the same way. Skipping this makes the overlay use `:root` (light) even when opened from an `iosDark` screen.

---

## Form sheets

`FormSheetModal` default `appearance = 'light'`.

`NewReportDialog.jsx` passes `appearance="dark"` (resolved to `iosDark`). `NewAppointmentDialog`, `NewProfileDialog`, and `InvestigationSelect` do **not** pass `appearance`, so they stay light.

Because a RN `Modal` is a new native window, the sheet cannot rely on a parent screen’s `ThemeProvider`. `FormSheetModal` therefore:

1. `resolveAppearanceName(appearance)` + `getAppearance(...)` **outside** the provider (needed for `Modal` `userInterfaceStyle` and `StatusBar` before children mount).
2. Spreads `userInterfaceStyle` onto `Modal` when the theme has one (both palettes set it).
3. Renders `<StatusBar style={theme.statusBarStyle} />` inside the modal.
4. Wraps body in `<ThemeProvider appearance={appearanceName} className="flex-1 bg-background">`.

`FormSheetBody` (inside the provider) is the only place allowed to branch on **layout**:

- `theme.layout.header === 'toolbar'` (`iosDark`): row with `CircleX` | centered title | optional `CircleCheck` confirm (or an empty `h-8 w-8` spacer if no `onConfirm`).
- else (`light`): absolute `CircleX` top-left, optional confirm top-right, title below (`px-10 pt-14`).

Confirm control: `onConfirm` + `confirmDisabled` / `confirmLoading`. Loading shows `ActivityIndicator` with `theme.colors.tint`. Inactive confirm uses `theme.colors.tintDisabled`. `NewReportDialog` uses this instead of a footer Save button. Light sheets that still pass `footer` keep the footer `View` (`px-10 p-4`).

Scroll padding comes from `theme.layout.contentPadding` and the title-aware top padding fields.

---

## Navigation chrome

Tab **header** and **tab bar** are not inside screen `ThemeProvider` views. Per-tab options in `app/(tabs)/_layout.tsx`:

```tsx
...appearances.iosDark.navigation
```

is spread on:

- `name="index"` (Overview)
- `name="reports"` (Reports)

Appointments (`href: null`), More (`headerShown: false`), and Logout do not spread that object. Default `Tabs` `screenOptions` still set `tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint` from `lib/theme.ts` for screens that do not override it.

React Navigation applies a tab screen’s `tabBarStyle` while that tab is focused. Switching Overview ↔ Reports stays dark. Focusing More/Logout uses that screen’s options (no `iosDark` tab bar override on those screens).

Auth stack (`app/(auth)/_layout.jsx`) has `headerShown: false`. Login/Register paint status bar themselves.

---

## Current opt-in surfaces

Wrapped with `<ThemeProvider appearance="iosDark" className="flex-1 bg-background">`:

| Screen | File |
|--------|------|
| Overview | `app/(tabs)/index.jsx` |
| Reports | `app/(tabs)/reports.jsx` |
| Login | `app/(auth)/login.jsx` |
| Register | `app/(auth)/register.jsx` |

Sheet:

| Dialog | File | How |
|--------|------|-----|
| New report | `components/NewReportDialog.jsx` | `FormSheetModal appearance="dark"` |

**Not** opted in (remain default light / `:root`):

- Appointments tab content (`app/(tabs)/appointments.jsx`)
- More stack (`app/(tabs)/more/*`), including analyse-reports and compare
- Verify (`app/(auth)/verify/[emailToken].jsx`)
- `NewAppointmentDialog`, `NewProfileDialog`, `InvestigationSelect`
- `CompareChart.jsx` still uses hardcoded `#30425f` / `#e54d2e` / `#b8c0d9` / `#6b7280` (not `useTheme()`)

`ReportCard` / `CardView` / `HealthGraph` / `LineChart` / form fields **do** call `useTheme()`, but without a parent `iosDark` provider they receive the default light context.

---

## Shared components — expected classes

These already use semantic tokens. Prefer extending them over adding hex.

**Form fields** (`form-field-input`, `form-field-textarea`): label `text-sm font-medium text-muted-foreground`; control `rounded-[10px] border border-input bg-card … text-foreground`; errors `text-destructive`. Select trigger adds `bg-card`. Date trigger: `rounded-[10px] border border-input bg-card`.

**Cards:** `CardView` is `rounded-[10px] bg-card`. Menu labels `text-popover-foreground` or `text-destructive`. `WidgetView` is `rounded-lg border border-border bg-card` with `bg-muted/30` header.

**Buttons on iosDark screens:** default variant is enough for the blue CTA; screens add `h-11 rounded-[10px] shadow-none` where they want the taller iOS-like control. Lucide icons on those buttons use `theme.colors.primaryForeground`, not a hardcoded `#fff`.

**Destructive confirm:** `ReportCard` passes `className="bg-destructive"` on `AlertDialogAction` (not appearance-specific).

---

## How to theme another screen

1. Wrap the screen root:

   ```jsx
   export default function SomeScreen() {
     return (
       <ThemeProvider appearance="iosDark" className="flex-1 bg-background">
         <SomeView />
       </ThemeProvider>
     );
   }
   ```

2. Call `useTheme()` **inside** the child, not in the same component that renders the provider.

3. Replace hex / `dark:` color classes with tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `text-primary`, `text-destructive`).

4. For `TextInput`: `placeholderTextColor={theme.colors.placeholder}`, `keyboardAppearance={theme.keyboardAppearance}`, `selectionColor={theme.colors.tint}`.

5. For lucide `color` props: `theme.colors.primary`, `theme.colors.tint`, `theme.colors.mutedForeground`, `theme.colors.destructive`, `theme.colors.close` as appropriate.

6. For `StatusBar`: `{isFocused ? <StatusBar style={theme.statusBarStyle} /> : null}` on tab screens so it does not leak to other tabs (tabs stay mounted). Auth screens can always show it.

7. If the screen is a tab with a header/tab bar, spread `...appearances.iosDark.navigation` on that `Tabs.Screen` in `app/(tabs)/_layout.tsx`.

8. If it is a form sheet, pass `appearance="iosDark"` or `appearance="dark"` to `FormSheetModal` instead of wrapping the parent only (the Modal is a separate window).

9. Do not wrap the entire `app/_layout.tsx` tree unless the product decision is “whole app is iosDark”. Today opt-in is per screen.

---

## How to add or change a palette

Edit `PALETTES` in `lib/appearance.js` only.

- Hex in `colors` (RN props, navigation, calendar, charts).
- Matching HSL channels in `channels` (must stay in sync with `colors` or class names and RN props will disagree).
- Channel format: `'211 100% 52%'` — no `hsl()`, same as `global.css`.
- If you add a Tailwind color, add it to `tailwind.config.js` **and** to every palette’s `channels`.
- Export a new key from `appearances` if `_layout.tsx` needs it without a provider.
- Keep `resolveAppearanceName` aliases (`dark` → `iosDark`) documented if you add more.

Do not copy hex into screen files.

---

## Rules for agents

**Do**

- Set appearance once at the boundary (`ThemeProvider` or `FormSheetModal appearance`).
- Use semantic NativeWind classes in leaves.
- Re-apply `theme.vars` on new portal roots.
- Use `useTheme()` only for props CSS cannot style.

**Do not**

- Add `isDark ? … : …` color branches in cards, fields, charts, or screens.
- Use Tailwind `dark:` for this system.
- Import `ThemeProvider` from `@react-navigation/native` when you meant `@/components/ThemeProvider`.
- Use `hooks/use-theme-color.ts` for these palettes.
- Assume wrapping Overview also themes More/analyse-reports (`LineChart` there is still light via default context).
- Assume wrapping Reports themes `NewAppointmentDialog` (separate modal, default `appearance='light'`).
- Put `bg-background` on the same `View` as `style={theme.vars}` and expect the background to use the remapped token (use the two-layer wrapper `ThemeProvider` already has).

---

## Checklist: new iosDark screen

1. `ThemeProvider appearance="iosDark" className="flex-1 bg-background"`.
2. Inner component calls `useTheme()`.
3. Semantic classes only; RN props from `theme.*`.
4. Tab chrome: `...appearances.iosDark.navigation` if the screen has a stack header/tab bar.
5. Status bar: `theme.statusBarStyle`, gated with `useIsFocused` on tabs.
6. Any new portal: wrap with `style={theme.vars}`.
7. Form sheet on that screen: set `FormSheetModal` `appearance` explicitly.
