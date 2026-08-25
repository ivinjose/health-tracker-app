import { useSetAppearance, useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { CARD_LIST_GAP } from '@/constants/layout';
import { APPEARANCE_NAMES } from '@/lib/appearance';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

const THEME_LABELS = {
	light: 'Light',
	dark: 'Dark',
};

export default function SettingsScreen() {
	const theme = useTheme();
	const setAppearance = useSetAppearance();

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4" style={{ gap: CARD_LIST_GAP }}>
				<Text className="text-sm font-medium text-muted-foreground">Theme</Text>
				<View className="overflow-hidden rounded-lg border border-border bg-card">
					{APPEARANCE_NAMES.map((name, index) => {
						const selected = theme.name === name;
						return (
							<Pressable
								key={name}
								onPress={() => setAppearance(name)}
								className={cn(
									'flex-row items-center justify-between px-4 py-4',
									index > 0 && 'border-t border-border'
								)}
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								accessibilityLabel={THEME_LABELS[name] ?? name}
							>
								<Text className="font-medium text-foreground">
									{THEME_LABELS[name] ?? name}
								</Text>
								{selected ? <Check size={18} color={theme.colors.tint} /> : null}
							</Pressable>
						);
					})}
				</View>
			</View>
		</ScrollView>
	);
}
