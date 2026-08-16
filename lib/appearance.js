import { vars } from 'nativewind';

const PALETTES = {
	light: {
		colors: {
			background: '#ffffff',
			foreground: '#0a0a0a',
			card: '#ffffff',
			cardForeground: '#0a0a0a',
			popover: '#ffffff',
			popoverForeground: '#0a0a0a',
			primary: '#171717',
			primaryForeground: '#fafafa',
			secondary: '#f5f5f5',
			muted: '#f5f5f5',
			mutedForeground: '#737373',
			accent: '#f5f5f5',
			accentForeground: '#0a0a0a',
			destructive: '#ef4444',
			destructiveForeground: '#fafafa',
			border: '#e5e5e5',
			input: '#e5e5e5',
			placeholder: '#9ca3af',
			tint: '#007AFF',
			tintDisabled: '#9ca3af',
			close: '#4c4c4c',
		},
		channels: {
			'--background': '0 0% 100%',
			'--foreground': '0 0% 3.9%',
			'--card': '0 0% 100%',
			'--card-foreground': '0 0% 3.9%',
			'--popover': '0 0% 100%',
			'--popover-foreground': '0 0% 3.9%',
			'--primary': '0 0% 9%',
			'--primary-foreground': '0 0% 98%',
			'--secondary': '0 0% 96.1%',
			'--secondary-foreground': '0 0% 9%',
			'--muted': '0 0% 96.1%',
			'--muted-foreground': '0 0% 45.1%',
			'--accent': '0 0% 96.1%',
			'--accent-foreground': '0 0% 9%',
			'--destructive': '0 84.2% 60.2%',
			'--destructive-foreground': '0 0% 98%',
			'--border': '0 0% 89.8%',
			'--input': '0 0% 89.8%',
			'--ring': '0 0% 3.9%',
		},
		keyboardAppearance: 'light',
		statusBarStyle: 'dark',
		userInterfaceStyle: 'light',
		layout: {
			header: 'stacked',
			contentPadding: 40,
			contentPaddingTopWithTitle: 16,
			contentPaddingTopWithoutTitle: 56,
		},
		chart: {
			line: '#30425f',
			lineSecondary: '#e54d2e',
			axis: '#b8c0d9',
			label: '#6b7280',
		},
	},
	iosDark: {
		colors: {
			background: '#1C1C1E',
			foreground: '#FFFFFF',
			card: '#2C2C2E',
			cardForeground: '#FFFFFF',
			popover: '#2C2C2E',
			popoverForeground: '#FFFFFF',
			primary: '#0A84FF',
			primaryForeground: '#FFFFFF',
			secondary: '#2C2C2E',
			muted: '#2C2C2E',
			mutedForeground: '#8E8E93',
			accent: '#3A3A3C',
			accentForeground: '#FFFFFF',
			destructive: '#FF453A',
			destructiveForeground: '#FFFFFF',
			border: '#3A3A3C',
			input: '#2C2C2E',
			placeholder: '#8E8E93',
			tint: '#0A84FF',
			tintDisabled: '#636366',
			close: '#8E8E93',
		},
		channels: {
			'--background': '240 3% 11%',
			'--foreground': '0 0% 100%',
			'--card': '240 2% 18%',
			'--card-foreground': '0 0% 100%',
			'--popover': '240 2% 18%',
			'--popover-foreground': '0 0% 100%',
			'--primary': '211 100% 52%',
			'--primary-foreground': '0 0% 100%',
			'--secondary': '240 2% 18%',
			'--secondary-foreground': '0 0% 100%',
			'--muted': '240 2% 18%',
			'--muted-foreground': '240 2% 57%',
			'--accent': '240 2% 23%',
			'--accent-foreground': '0 0% 100%',
			'--destructive': '3 100% 61%',
			'--destructive-foreground': '0 0% 100%',
			'--border': '240 2% 23%',
			'--input': '240 2% 18%',
			'--ring': '211 100% 52%',
		},
		keyboardAppearance: 'dark',
		statusBarStyle: 'light',
		userInterfaceStyle: 'dark',
		layout: {
			header: 'toolbar',
			contentPadding: 20,
			contentPaddingTopWithTitle: 8,
			contentPaddingTopWithoutTitle: 8,
		},
		chart: {
			line: '#0A84FF',
			lineSecondary: '#FF453A',
			axis: '#3A3A3C',
			label: '#8E8E93',
		},
	},
};

function toCalendar(colors) {
	return {
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
	};
}

function toNavigation(colors) {
	return {
		headerStyle: { backgroundColor: colors.background },
		headerTintColor: colors.foreground,
		headerTitleStyle: { color: colors.foreground, fontWeight: '600' },
		headerShadowVisible: false,
		tabBarStyle: {
			backgroundColor: colors.background,
			borderTopColor: colors.border,
		},
		tabBarActiveTintColor: colors.tint,
		tabBarInactiveTintColor: colors.mutedForeground,
	};
}

function toReactNavigation(colors, userInterfaceStyle) {
	return {
		dark: userInterfaceStyle === 'dark',
		colors: {
			primary: colors.tint,
			background: colors.background,
			card: colors.background,
			text: colors.foreground,
			border: colors.border,
			notification: colors.destructive,
		},
	};
}

function buildAppearance(name) {
	const source = PALETTES[name];
	const { colors } = source;
	return {
		name,
		colors,
		vars: vars(source.channels),
		calendar: toCalendar(colors),
		keyboardAppearance: source.keyboardAppearance,
		statusBarStyle: source.statusBarStyle,
		userInterfaceStyle: source.userInterfaceStyle,
		layout: source.layout,
		navigation: toNavigation(colors),
		reactNavigation: toReactNavigation(colors, source.userInterfaceStyle),
		chart: source.chart ?? {
			line: colors.tint,
			lineSecondary: colors.destructive,
			axis: colors.border,
			label: colors.mutedForeground,
		},
	};
}

const cache = {};

export const APP_APPEARANCE = 'iosDark';

export function resolveAppearanceName(name = APP_APPEARANCE) {
	if (name === 'dark') return 'iosDark';
	return PALETTES[name] ? name : APP_APPEARANCE;
}

export function getAppearance(name = APP_APPEARANCE) {
	const key = resolveAppearanceName(name);
	if (!cache[key]) {
		cache[key] = buildAppearance(key);
	}
	return cache[key];
}

export const appearances = {
	light: getAppearance('light'),
	iosDark: getAppearance('iosDark'),
};
