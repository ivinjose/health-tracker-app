import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function Checkbox({
	checked = false,
	onCheckedChange,
	disabled = false,
	className,
	...props
}) {
	const theme = useTheme();
	const interactive = Boolean(onCheckedChange) && !disabled;
	const Box = interactive ? Pressable : View;
	return (
		<Box
			onPress={interactive ? () => onCheckedChange(!checked) : undefined}
			disabled={interactive ? disabled : undefined}
			hitSlop={interactive ? 14 : undefined}
			className={cn(
				'h-4 w-4 items-center justify-center rounded-sm border border-primary',
				checked && 'bg-primary',
				disabled && 'opacity-50',
				className
			)}
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
			{...props}
		>
			{checked ? <Check size={12} color={theme.colors.primaryForeground} /> : null}
		</Box>
	);
}
