import FormSheetModal from '@/components/FormSheetModal';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput } from 'react-native';

const investigationId = (item) => String(item?._id ?? '');

export default function InvestigationPickerModal({
	open,
	onOpenChange,
	results = [],
	currentValue,
	excludeValues,
	onSelect,
	title = 'Select investigation',
}) {
	const theme = useTheme();
	const [search, setSearch] = useState('');

	const selectable = useMemo(() => {
		if (!excludeValues?.length) return results;
		const excluded = new Set(excludeValues.map(String));
		return results.filter((item) => !excluded.has(investigationId(item)));
	}, [results, excludeValues]);

	const filteredResults = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return selectable;
		return selectable.filter((item) => item.label?.toLowerCase().includes(query));
	}, [selectable, search]);

	const handleOpenChange = (nextOpen) => {
		if (!nextOpen) setSearch('');
		onOpenChange(nextOpen);
	};

	const handleSelect = (id) => {
		onSelect(id);
		handleOpenChange(false);
	};

	const currentId = currentValue != null ? String(currentValue) : '';

	return (
		<FormSheetModal
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			scrollable={false}
		>
			<TextInput
				value={search}
				onChangeText={setSearch}
				placeholder="Start typing to search"
				className="mb-4 rounded-lg border border-input bg-card px-3 py-2 text-base leading-tight text-foreground"
				placeholderTextColor={theme.colors.placeholder}
				keyboardAppearance={theme.keyboardAppearance}
				selectionColor={theme.colors.tint}
			/>
			<FlatList
				data={filteredResults}
				keyExtractor={(item) => investigationId(item)}
				keyboardShouldPersistTaps="handled"
				className="flex-1"
				ListEmptyComponent={
					<Text className="py-4 text-center text-muted-foreground">
						No results found
					</Text>
				}
				renderItem={({ item }) => {
					const id = investigationId(item);
					return (
						<Pressable
							onPress={() => handleSelect(id)}
							className="border-b border-border py-3"
						>
							<Text
								className={
									id === currentId
										? 'font-semibold text-primary'
										: 'text-foreground'
								}
							>
								{item.label}
							</Text>
						</Pressable>
					);
				}}
			/>
		</FormSheetModal>
	);
}
