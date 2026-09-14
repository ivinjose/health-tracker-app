import { useTheme } from '@/components/ThemeProvider';
import { Maximize2 } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function ChartExpandButton({ onPress, accessibilityLabel = 'Expand chart' }) {
	const theme = useTheme();

	return (
		<Pressable
			onPress={onPress}
			hitSlop={8}
			className="h-8 w-8 items-center justify-center"
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
		>
			<Maximize2 size={18} color={theme.colors.mutedForeground} />
		</Pressable>
	);
}
