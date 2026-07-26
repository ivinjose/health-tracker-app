import { Stack } from 'expo-router';

export default function MoreLayout() {
	return (
		<Stack
			screenOptions={{
				headerBackTitle: 'More',
			}}
		>
			<Stack.Screen name="index" options={{ title: 'More' }} />
			<Stack.Screen name="profiles" options={{ title: 'Profiles' }} />
			<Stack.Screen name="compare" options={{ title: 'Compare Reports' }} />
			<Stack.Screen name="analyse-reports/index" options={{ title: 'Analyse Reports' }} />
			<Stack.Screen
				name="analyse-reports/[investigation]"
				options={{ title: 'Analyse Reports' }}
			/>
		</Stack>
	);
}
