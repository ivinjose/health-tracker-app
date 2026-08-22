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
	it('defaults to iosDark, matching APP_APPEARANCE', () => {
		expect(APP_APPEARANCE).toBe('iosDark');
		expect(resolveAppearanceName()).toBe('iosDark');
	});

	it('returns known palette names unchanged', () => {
		expect(resolveAppearanceName('light')).toBe('light');
		expect(resolveAppearanceName('iosDark')).toBe('iosDark');
	});

	it('maps the alias "dark" to iosDark', () => {
		expect(resolveAppearanceName('dark')).toBe('iosDark');
	});

	it('falls back to APP_APPEARANCE for unknown names', () => {
		expect(resolveAppearanceName('midnight')).toBe('iosDark');
		expect(resolveAppearanceName('')).toBe('iosDark');
	});
});

describe('getAppearance', () => {
	it('returns the iosDark appearance by default', () => {
		const appearance = getAppearance();

		expect(appearance.name).toBe('iosDark');
		expect(appearance.userInterfaceStyle).toBe('dark');
		expect(appearance.keyboardAppearance).toBe('dark');
		expect(appearance.statusBarStyle).toBe('light');
	});

	it('builds light appearance tokens from the light palette', () => {
		const appearance = getAppearance('light');

		expect(appearance.name).toBe('light');
		expect(appearance.colors.background).toBe('#ffffff');
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
		const appearance = getAppearance('iosDark');
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

	it('resolves "dark" and unknown names through resolveAppearanceName', () => {
		expect(getAppearance('dark')).toBe(getAppearance('iosDark'));
		expect(getAppearance('not-a-theme').name).toBe('iosDark');
	});

	it('caches appearances by resolved name and returns the same object', () => {
		expect(getAppearance('light')).toBe(getAppearance('light'));
		expect(getAppearance('dark')).toBe(getAppearance('iosDark'));
	});

	it('exposes prebuilt light and iosDark appearances', () => {
		expect(appearances.light).toBe(getAppearance('light'));
		expect(appearances.iosDark).toBe(getAppearance('iosDark'));
	});

	it('stores CSS channel vars on the appearance (mocked nativewind vars)', () => {
		const appearance = getAppearance('light');

		expect(appearance.vars['--background']).toBe('0 0% 100%');
		expect(appearance.vars['--primary']).toBe('0 0% 9%');
	});
});
