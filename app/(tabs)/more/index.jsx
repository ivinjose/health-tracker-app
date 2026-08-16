import { useTheme } from '@/components/ThemeProvider';
import UserMenu from '@/components/User';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

const MENU_ITEMS = [
	{
		label: 'Analyse reports',
		href: '/(tabs)/more/analyse-reports',
	},
	{
		label: 'Compare reports',
		href: '/(tabs)/more/compare',
	},
	{
		label: 'Profiles',
		href: '/(tabs)/more/profiles',
	},
];

export default function MoreScreen() {
	const theme = useTheme();

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
			</View>
		</ScrollView>
	);
}
