import FormFieldLabel, {
	requiredFieldAccessibilityLabel,
} from '@/components/FormFieldLabel';
import LabelChip from '@/components/LabelChip';
import LabelPickerModal from '@/components/LabelPickerModal';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { LABEL_FILTER_MAX } from '@/constants/labels';
import { getLabelsByIds } from '@/lib/labelUtils';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function LabelsFilter({
	labels = [],
	selectedIds = [],
	onChange,
	labelText = 'Labels',
	placeholder = 'All labels',
}) {
	const [open, setOpen] = useState(false);
	const ids = selectedIds.map(String);
	const selected = getLabelsByIds(labels, ids);
	const atCap = ids.length >= LABEL_FILTER_MAX;

	const removeId = (id) => {
		onChange(ids.filter((current) => current !== String(id)));
	};

	const addId = (id) => {
		const next = String(id);
		if (!next || ids.includes(next) || atCap) return;
		onChange([...ids, next]);
	};

	return (
		<View>
			<FormFieldLabel labelText={labelText} />
			<Pressable
				onPress={() => setOpen(true)}
				disabled={atCap}
				className={`flex-row items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-3 ${atCap ? 'opacity-50' : ''}`}
				accessibilityRole="button"
				accessibilityLabel={requiredFieldAccessibilityLabel(labelText, false)}
				accessibilityValue={{ text: placeholder }}
				accessibilityState={{ disabled: atCap }}
			>
				<Text className="min-w-0 flex-1 text-muted-foreground" numberOfLines={1}>
					{placeholder}
				</Text>
				<Icon
					as={Plus}
					className="shrink-0 text-muted-foreground"
					size={16}
				/>
			</Pressable>
			{selected.length > 0 ? (
				<View className="mt-2 flex-row flex-wrap gap-2">
					{selected.map((item) => (
						<LabelChip
							key={String(item._id)}
							name={item.name}
							color={item.color}
							onRemove={() => removeId(item._id)}
						/>
					))}
				</View>
			) : null}

			<LabelPickerModal
				open={open}
				onOpenChange={setOpen}
				results={labels}
				excludeValues={ids}
				onSelect={addId}
			/>
		</View>
	);
}
