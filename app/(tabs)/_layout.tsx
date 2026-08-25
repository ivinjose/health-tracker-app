import React from 'react';

import { Redirect, Tabs } from 'expo-router';
import { CalendarPlus, ChartLine, FileText, GitCompareArrows, LayoutGrid } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import { HapticTab } from '@/components/ui/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import useAuth from '../../hooks/useAuth';

export default function AppLayout() {
	const theme = useTheme();
	const { auth, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color={theme.colors.tint} />
			</View>
		);
	}

	if (!auth?.id) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<Tabs
			screenOptions={{
				...theme.navigation,
				headerShown: true,
				tabBarButton: HapticTab,
			}}>
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: 'Home',
					title: 'Overview',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="appointments"
				options={{
					href: null, // Hiding the tab bar icon for now since its convoluting the focus away from the health metrics
					title: 'Appointments',
					tabBarIcon: ({ color }) => <CalendarPlus size={26} color={color} strokeWidth={1.5} />,
				}}
			/>
			<Tabs.Screen
				name="analyse"
				options={{
					tabBarLabel: 'Analyse',
					headerTitle: 'Analyse Reports',
					tabBarIcon: ({ color }) => <ChartLine size={26} color={color} strokeWidth={1.5} />,
				}}
			/>
			<Tabs.Screen
				name="compare"
				options={{
					tabBarLabel: 'Compare',
					headerTitle: 'Compare Reports',
					tabBarIcon: ({ color }) => <GitCompareArrows size={26} color={color} strokeWidth={1.5} />,
				}}
			/>
			<Tabs.Screen
				name="reports"
				options={{
					tabBarLabel: 'Manage',
					headerTitle: 'Manage Reports',
					tabBarIcon: ({ color }) => <FileText size={26} color={color} strokeWidth={1.5} />,
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: 'More',
					headerShown: false,
					tabBarIcon: ({ color }) => <LayoutGrid size={26} color={color} strokeWidth={1.5} />,
				}}
			/>
		</Tabs>
	);
}
