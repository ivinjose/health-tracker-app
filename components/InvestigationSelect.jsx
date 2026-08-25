import InvestigationPickerModal from '@/components/InvestigationPickerModal';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

export default function InvestigationSelect({
	results = [],
	currentValue,
	onSelectCb,
	labelText = 'Investigation',
}) {
	const [isOpen, setIsOpen] = useState(false);

	const selectedLabel = useMemo(() => {
		const match = results.find((item) => item.value === currentValue);
		return match?.label ?? 'Select your preference...';
	}, [results, currentValue]);

	return (
		<View className="gap-2">
			{labelText ? <Text className="font-medium text-foreground">{labelText}</Text> : null}
			<Button variant="outline" onPress={() => setIsOpen(true)} className="justify-between">
				<Text className="text-foreground">{selectedLabel}</Text>
			</Button>

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
