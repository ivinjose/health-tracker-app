import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { contrastTextColor } from '@/lib/labelUtils';
import { X } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export default function LabelChip({ name, color, onRemove }) {
	const backgroundColor = color || '#64748B';
	const textColor = contrastTextColor(backgroundColor);

	return (
		<View
			className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
			style={{ backgroundColor }}
		>
			<Text
				className="text-xs font-medium"
				style={{ color: textColor }}
				numberOfLines={1}
			>
				{name}
			</Text>
			{onRemove ? (
				<Pressable
					onPress={onRemove}
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel={`Remove ${name}`}
				>
					<Icon as={X} size={12} color={textColor} className="shrink-0" />
				</Pressable>
			) : null}
		</View>
	);
}
