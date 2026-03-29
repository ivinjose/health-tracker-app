import React from 'react';

import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import useAuth from '../../hooks/useAuth';

import { HapticTab } from '@/components/ui/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LogoutTabButton } from '@/components/ui/logout-tab-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useLogout from '@/hooks/useLogout';
import { Colors } from '@/lib/theme';
import { Train } from "lucide-react-native";

export default function AppLayout() {
	const colorScheme = useColorScheme();
	const logout = useLogout();
	const { auth, isLoading } = useAuth();

	// 1. Show a loader while checking the token (Step 3 logic)
	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	// 2. If no token, redirect to Login (The ProtectedRoute logic)
	if (!auth?.id) {
		return <Redirect href="/(auth)/login" />;
	}

	// 3. If logged in, show the Tab Navigation
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
					title: 'Manage Off Days',
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
					// headerRight: () => (
					// 	<Pressable
					// 		onPress={async () => {
					// 			await logout();
					// 		}}
					// 		style={{ marginRight: 15 }}
					// 	>
					// 		<LogOut size={24} color="red" />
					// 	</Pressable>
					// ),
				}}
			/>
			<Tabs.Screen
				name="TrainBookingsPage"
				options={{
					title: 'Booking reminders',
					tabBarIcon: ({ color }) => <Train size={28} color={color} strokeWidth={1.5} />,
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