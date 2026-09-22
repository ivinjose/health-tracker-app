import InvestigationPickerModal from '@/components/InvestigationPickerModal';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { CircleX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function InvestigationSelect({
	results = [],
	currentValue,
	onSelectCb,
	labelText = 'Investigation',
	placeholder = 'Choose from the list',
	allowClear = false,
}) {
	const theme = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const hasValue = currentValue != null && String(currentValue) !== '';

	const selectedLabel = useMemo(() => {
		const match = results.find((item) => String(item._id) === String(currentValue));
		return match?.label ?? placeholder;
	}, [results, currentValue, placeholder]);

	return (
		<View className="gap-2">
			{labelText ? <Text className="font-medium text-foreground">{labelText}</Text> : null}
			<View className="flex-row items-center rounded-lg border border-input">
				<Pressable
					onPress={() => setIsOpen(true)}
					className="min-h-11 flex-1 justify-center px-3 py-3"
					accessibilityRole="button"
					accessibilityLabel={labelText}
				>
					<Text className={hasValue ? 'text-foreground' : 'text-muted-foreground'}>
						{selectedLabel}
					</Text>
				</Pressable>
				{allowClear && hasValue ? (
					<Pressable
						onPress={() => onSelectCb(undefined)}
						className="h-11 w-11 items-center justify-center"
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel="Clear investigation"
					>
						<CircleX size={18} color={theme.colors.close} />
					</Pressable>
				) : null}
			</View>

			<InvestigationPickerModal
				open={isOpen}
				onOpenChange={setIsOpen}
				results={results}
				currentValue={currentValue}
				onSelect={onSelectCb}
			/>
		</View>
	);
}
