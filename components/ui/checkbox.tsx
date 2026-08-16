import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';

export function Checkbox({
	checked = false,
	onCheckedChange,
	disabled = false,
	className,
}) {
	const theme = useTheme();
	return (
		<Pressable
			onPress={() => onCheckedChange?.(!checked)}
			disabled={disabled}
			className={cn(
				'h-4 w-4 items-center justify-center rounded-sm border border-primary',
				checked && 'bg-primary',
				disabled && 'opacity-50',
				className
			)}
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
		>
			{checked ? <Check size={12} color={theme.colors.primaryForeground} /> : null}
		</Pressable>
	);
}
