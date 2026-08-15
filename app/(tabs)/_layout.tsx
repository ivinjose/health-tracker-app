import React from 'react';

import { Redirect, Tabs } from 'expo-router';
import { CalendarPlus, FileText, LayoutGrid } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/ui/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LogoutTabButton } from '@/components/ui/logout-tab-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/lib/theme';
import useAuth from '../../hooks/useAuth';

export default function AppLayout() {
	const colorScheme = useColorScheme();
	const { auth, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!auth?.id) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: true,
				tabBarButton: HapticTab,
			}}>
			<Tabs.Screen
				name="index"
				options={{
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
				name="reports"
				options={{
					title: 'Reports',
					headerStyle: { backgroundColor: '#1C1C1E' },
					headerTintColor: '#FFFFFF',
					headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
					headerShadowVisible: false,
					tabBarStyle: {
						backgroundColor: '#1C1C1E',
						borderTopColor: '#3A3A3C',
					},
					tabBarActiveTintColor: '#0A84FF',
					tabBarInactiveTintColor: '#8E8E93',
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
			<Tabs.Screen
				name="logout"
				options={{
					title: 'Logout',
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="rectangle.portrait.and.arrow.right" color={color} />
					),
					tabBarButton: (props) => <LogoutTabButton {...props} />,
				}}
			/>
		</Tabs>
	);
}
