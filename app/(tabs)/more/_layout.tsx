import { APP_APPEARANCE, getAppearance } from '@/lib/appearance';
import { Stack } from 'expo-router';

const appTheme = getAppearance(APP_APPEARANCE);

export default function MoreLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitle: 'More',
				headerStyle: appTheme.navigation.headerStyle,
				headerTintColor: appTheme.navigation.headerTintColor,
				headerTitleStyle: appTheme.navigation.headerTitleStyle,
				headerShadowVisible: appTheme.navigation.headerShadowVisible,
			}}
		>
			<Stack.Screen name="index" options={{ title: 'More' }} />
			<Stack.Screen name="profiles" options={{ title: 'Profiles' }} />
			<Stack.Screen name="investigations" options={{ title: 'Investigations' }} />
		</Stack>
	);
}
