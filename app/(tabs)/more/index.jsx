import { useTheme } from '@/components/ThemeProvider';
import UserMenu from '@/components/User';
import { Text } from '@/components/ui/text';
import useLogout from '@/hooks/useLogout';
import { Link, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

const MENU_ITEMS = [
	{
		label: 'Profiles',
		href: '/(tabs)/more/profiles',
	},
	{
		label: 'Investigations',
		href: '/(tabs)/more/investigations',
	},
];

export default function MoreScreen() {
	const theme = useTheme();
	const logout = useLogout();
	const router = useRouter();

	const onLogout = async () => {
		await logout();
		// agent added the below line, but looks like its not needed since logout will automatically redirect to login page.
		// router.replace('/(auth)/login');
	};

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="border-b border-border p-4">
				<UserMenu />
			</View>

			<View className="gap-1 p-4">
				{MENU_ITEMS.map((item) => (
					<Link key={item.href} href={item.href} asChild>
						<Pressable className="flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-4">
							<Text className="font-medium text-foreground">{item.label}</Text>
							<ChevronRight size={18} color={theme.colors.mutedForeground} />
						</Pressable>
					</Link>
				))}
				<Pressable
					onPress={onLogout}
					className="flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-4"
				>
					<Text className="font-medium text-destructive">Logout</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
