import { useTheme } from '@/components/ThemeProvider';
import { Text, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function PageHeader({ text, showBack = false }) {
	const theme = useTheme();
	const router = useRouter();

	return (
		<View className="border-b border-border px-4 py-3">
			{showBack ? (
				<Pressable
					onPress={() => router.back()}
					className="mb-2 -ml-1 flex-row items-center gap-1 self-start py-1"
					hitSlop={8}
				>
					<ChevronLeft size={20} color={theme.colors.primary} />
					<Text className="text-sm text-primary">Back</Text>
				</Pressable>
			) : null}
			<Text className="text-xl font-semibold text-foreground">{text}</Text>
		</View>
	);
}
