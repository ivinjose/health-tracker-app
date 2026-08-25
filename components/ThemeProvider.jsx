import { APP_APPEARANCE, getAppearance, resolveAppearanceName } from '@/lib/appearance';
import { loadAppearanceName, saveAppearanceName } from '@/lib/appearanceStorage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, View } from 'react-native';

const defaultTheme = getAppearance(APP_APPEARANCE);
const ThemeStateContext = createContext({
	theme: defaultTheme,
	setAppearance: () => {},
});

function applyNativeColorScheme(name) {
	try {
		Appearance.setColorScheme(resolveAppearanceName(name));
	} catch {
		// Some runtimes do not implement setColorScheme.
	}
}

function RootThemeProvider({ className, style, children }) {
	const [name, setName] = useState(APP_APPEARANCE);

	useEffect(() => {
		let cancelled = false;
		loadAppearanceName().then((stored) => {
			if (!cancelled) {
				setName(stored);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		applyNativeColorScheme(name);
	}, [name]);

	const setAppearance = useCallback((nextName) => {
		const resolved = resolveAppearanceName(nextName);
		setName(resolved);
		saveAppearanceName(resolved);
	}, []);

	const theme = useMemo(() => getAppearance(name), [name]);
	const value = useMemo(() => ({ theme, setAppearance }), [theme, setAppearance]);

	return (
		<ThemeStateContext.Provider value={value}>
			<View style={[theme.vars, style]} className="flex-1">
				<View className={className ?? 'flex-1'}>{children}</View>
			</View>
		</ThemeStateContext.Provider>
	);
}

function NestedThemeProvider({ appearance, className, style, children }) {
	const parent = useContext(ThemeStateContext);
	const theme = useMemo(() => getAppearance(appearance), [appearance]);
	const value = useMemo(
		() => ({ theme, setAppearance: parent.setAppearance }),
		[theme, parent.setAppearance]
	);

	return (
		<ThemeStateContext.Provider value={value}>
			<View style={[theme.vars, style]} className="flex-1">
				<View className={className ?? 'flex-1'}>{children}</View>
			</View>
		</ThemeStateContext.Provider>
	);
}

export function ThemeProvider({ appearance = undefined, className, style = undefined, children }) {
	if (appearance != null) {
		return (
			<NestedThemeProvider appearance={appearance} className={className} style={style}>
				{children}
			</NestedThemeProvider>
		);
	}

	return (
		<RootThemeProvider className={className} style={style}>
			{children}
		</RootThemeProvider>
	);
}

export function useTheme() {
	return useContext(ThemeStateContext).theme;
}

export function useSetAppearance() {
	return useContext(ThemeStateContext).setAppearance;
}
