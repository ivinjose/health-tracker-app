import { APP_APPEARANCE, getAppearance } from '@/lib/appearance';
import { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';

const ThemeContext = createContext(getAppearance(APP_APPEARANCE));

export function ThemeProvider({ appearance = APP_APPEARANCE, className, style = undefined, children }) {
	const theme = useMemo(() => getAppearance(appearance), [appearance]);

	return (
		<ThemeContext.Provider value={theme}>
			<View style={[theme.vars, style]} className="flex-1">
				<View className={className ?? 'flex-1'}>{children}</View>
			</View>
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
