import {
	APP_APPEARANCE,
	appearances,
	getAppearance,
	resolveAppearanceName,
} from '../appearance';

jest.mock('nativewind', () => ({
	vars: (channels) => channels,
}));

describe('resolveAppearanceName', () => {
	it('defaults to dark, matching APP_APPEARANCE', () => {
		expect(APP_APPEARANCE).toBe('dark');
		expect(resolveAppearanceName()).toBe('dark');
	});

	it('returns known palette names unchanged', () => {
		expect(resolveAppearanceName('light')).toBe('light');
		expect(resolveAppearanceName('dark')).toBe('dark');
	});

	it('falls back to APP_APPEARANCE for unknown names', () => {
		expect(resolveAppearanceName('midnight')).toBe('dark');
		expect(resolveAppearanceName('')).toBe('dark');
	});
});

describe('getAppearance', () => {
	it('returns the dark appearance by default', () => {
		const appearance = getAppearance();

		expect(appearance.name).toBe('dark');
		expect(appearance.userInterfaceStyle).toBe('dark');
		expect(appearance.keyboardAppearance).toBe('dark');
		expect(appearance.statusBarStyle).toBe('light');
	});

	it('builds light appearance tokens from the light palette', () => {
		const appearance = getAppearance('light');

		expect(appearance.name).toBe('light');
		expect(appearance.colors.background).toBe('#ffffff');
		expect(appearance.colors.card).toBe('#F2F2F7');
		expect(appearance.colors.background).not.toBe(appearance.colors.card);
		expect(appearance.colors.tint).toBe('#007AFF');
		expect(appearance.userInterfaceStyle).toBe('light');
		expect(appearance.keyboardAppearance).toBe('light');
		expect(appearance.statusBarStyle).toBe('dark');
		expect(appearance.layout).toEqual({
			header: 'stacked',
			contentPadding: 40,
			contentPaddingTopWithTitle: 16,
			contentPaddingTopWithoutTitle: 56,
		});
		expect(appearance.chart).toEqual({
			line: '#30425f',
			lineSecondary: '#e54d2e',
			axis: '#b8c0d9',
			label: '#6b7280',
		});
	});

	it('maps palette colors onto the calendar theme', () => {
		const { colors, calendar } = getAppearance('light');

		expect(calendar).toEqual({
			backgroundColor: colors.background,
			calendarBackground: colors.background,
			textSectionTitleColor: colors.mutedForeground,
			selectedDayBackgroundColor: colors.tint,
			selectedDayTextColor: colors.primaryForeground,
			todayTextColor: colors.tint,
			dayTextColor: colors.foreground,
			textDisabledColor: colors.tintDisabled,
			monthTextColor: colors.foreground,
			arrowColor: colors.tint,
			indicatorColor: colors.tint,
		});
	});

	it('maps palette colors onto navigation and React Navigation themes', () => {
		const appearance = getAppearance('dark');
		const { colors } = appearance;

		expect(appearance.navigation.headerTintColor).toBe(colors.foreground);
		expect(appearance.navigation.tabBarActiveTintColor).toBe(colors.tint);
		expect(appearance.navigation.tabBarInactiveTintColor).toBe(colors.mutedForeground);
		expect(appearance.navigation.headerShadowVisible).toBe(false);
		expect(appearance.reactNavigation.dark).toBe(true);
		expect(appearance.reactNavigation.colors).toEqual({
			primary: colors.tint,
			background: colors.background,
			card: colors.background,
			text: colors.foreground,
			border: colors.border,
			notification: colors.destructive,
		});
	});

	it('marks the light React Navigation theme as not dark', () => {
		expect(getAppearance('light').reactNavigation.dark).toBe(false);
	});

	it('resolves unknown names through resolveAppearanceName', () => {
		expect(getAppearance('not-a-theme').name).toBe('dark');
	});

	it('caches appearances by resolved name and returns the same object', () => {
		expect(getAppearance('light')).toBe(getAppearance('light'));
		expect(getAppearance('dark')).toBe(getAppearance('dark'));
	});

	it('exposes prebuilt light and dark appearances', () => {
		expect(appearances.light).toBe(getAppearance('light'));
		expect(appearances.dark).toBe(getAppearance('dark'));
	});

	it('stores CSS channel vars on the appearance (mocked nativewind vars)', () => {
		const appearance = getAppearance('light');

		expect(appearance.vars['--background']).toBe('0 0% 100%');
		expect(appearance.vars['--card']).toBe('240 24% 96%');
		expect(appearance.vars['--primary']).toBe('0 0% 9%');
	});
});
