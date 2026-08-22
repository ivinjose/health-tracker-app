import { APP_APPEARANCE, getAppearance } from '@/lib/appearance';
import { Stack } from 'expo-router';

const appTheme = getAppearance(APP_APPEARANCE);

export default function AnalyseReportsLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitle: 'Analyse',
				headerStyle: appTheme.navigation.headerStyle,
				headerTintColor: appTheme.navigation.headerTintColor,
				headerTitleStyle: appTheme.navigation.headerTitleStyle,
				headerShadowVisible: appTheme.navigation.headerShadowVisible,
			}}
		>
			<Stack.Screen name="index" options={{ title: 'Analyse Reports' }} />
			<Stack.Screen name="[investigation]" options={{ title: 'View reports' }} />
		</Stack>
	);
}
