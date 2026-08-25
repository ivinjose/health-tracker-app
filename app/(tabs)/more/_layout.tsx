import { useTheme } from '@/components/ThemeProvider';
import { Stack } from 'expo-router';

export default function MoreLayout() {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				headerBackTitle: 'More',
				headerStyle: theme.navigation.headerStyle,
				headerTintColor: theme.navigation.headerTintColor,
				headerTitleStyle: theme.navigation.headerTitleStyle,
				headerShadowVisible: theme.navigation.headerShadowVisible,
			}}
		>
			<Stack.Screen name="index" options={{ title: 'More' }} />
			<Stack.Screen name="profiles" options={{ title: 'Profiles' }} />
			<Stack.Screen name="investigations" options={{ title: 'Investigations' }} />
			<Stack.Screen name="settings" options={{ title: 'Settings' }} />
		</Stack>
	);
}
