import { Stack } from 'expo-router';

export default function MoreLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitle: 'More',
			}}
		>
			<Stack.Screen name="index" options={{ title: 'More' }} />
			<Stack.Screen name="profiles" options={{ headerShown: false }} />
			<Stack.Screen name="compare" options={{ headerShown: false }} />
			<Stack.Screen name="analyse-reports/index" options={{ headerShown: false }} />
			<Stack.Screen name="analyse-reports/[investigation]" options={{ headerShown: false }} />
		</Stack>
	);
}
