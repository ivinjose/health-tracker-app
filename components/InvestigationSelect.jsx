import FormSheetModal from '@/components/FormSheetModal';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

export default function InvestigationSelect({
	results = [],
	currentValue,
	onSelectCb,
	labelText = 'Investigation',
}) {
	const theme = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState('');

	const selectedLabel = useMemo(() => {
		const match = results.find((item) => item.value === currentValue);
		return match?.label ?? 'Select your preference...';
	}, [results, currentValue]);

	const filteredResults = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return results;
		return results.filter(
			(item) =>
				item.label?.toLowerCase().includes(query) ||
				item.value?.toLowerCase().includes(query)
		);
	}, [results, search]);

	const handleSelect = (value) => {
		onSelectCb(value);
		setIsOpen(false);
		setSearch('');
	};

	return (
		<View className="gap-2">
			{labelText ? <Text className="font-medium text-foreground">{labelText}</Text> : null}
			<Button variant="outline" onPress={() => setIsOpen(true)} className="justify-between">
				<Text className="text-foreground">{selectedLabel}</Text>
			</Button>

			<FormSheetModal
				open={isOpen}
				onOpenChange={setIsOpen}
				title="Select investigation"
				scrollable={false}
			>
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder="Start typing to search"
					className="mb-4 rounded-lg border border-input px-3 py-2 text-foreground"
					placeholderTextColor={theme.colors.placeholder}
					keyboardAppearance={theme.keyboardAppearance}
					selectionColor={theme.colors.tint}
				/>
				<FlatList
					data={filteredResults}
					keyExtractor={(item) => item.value}
					keyboardShouldPersistTaps="handled"
					className="flex-1"
					ListEmptyComponent={
						<Text className="py-4 text-center text-muted-foreground">
							No results found
						</Text>
					}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => handleSelect(item.value)}
							className="border-b border-border py-3"
						>
							<Text
								className={
									item.value === currentValue
										? 'font-semibold text-primary'
										: 'text-foreground'
								}
							>
								{item.label}
							</Text>
						</Pressable>
					)}
				/>
			</FormSheetModal>
		</View>
	);
}
