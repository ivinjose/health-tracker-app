import UserMenu from '@/components/User';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

const MENU_ITEMS = [
	{
		label: 'Analyse reports',
		href: '/(tabs)/more/analyse-reports',
		phase: 'Phase 3',
	},
	{
		label: 'Compare reports',
		href: '/(tabs)/more/compare',
		phase: 'Phase 3',
	},
	{
		label: 'Profiles',
		href: '/(tabs)/more/profiles',
		phase: 'Phase 2',
	},
];

export default function MoreScreen() {
	return (
		<ScrollView className="flex-1 bg-background">
			<View className="border-b border-border p-4">
				<UserMenu />
			</View>

			<View className="gap-1 p-4">
				{MENU_ITEMS.map((item) => (
					<Link key={item.href} href={item.href} asChild>
						<Pressable className="flex-row items-center justify-between rounded-lg border border-border bg-card px-4 py-4">
							<View>
								<Text className="font-medium text-foreground">{item.label}</Text>
								<Text className="text-sm text-muted-foreground">{item.phase}</Text>
							</View>
							<ChevronRight size={18} color="#6b7280" />
						</Pressable>
					</Link>
				))}
			</View>
		</ScrollView>
	);
}
