/**
 * Form control for a report’s `labels` field: optional catalog tag ids.
 *
 * Value is a `string[]` of Label `_id`s. Distinct from {@link FormFieldLabel},
 * which only draws a caption, and from {@link FormFieldInvestigation}, which
 * stores one investigation id.
 */
import FormFieldLabel, {
	requiredFieldAccessibilityLabel,
} from '@/components/FormFieldLabel';
import LabelChip from '@/components/LabelChip';
import LabelPickerModal from '@/components/LabelPickerModal';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { getLabelsByIds } from '@/lib/labelUtils';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';

const MAX_REPORT_LABELS = 20;

/**
 * Multi-select Labels field: chips for attached ids, searchable picker to add more.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the id array (`labels`).
 * @param {string} [props.labelText]
 * @param {string} [props.placeholder]
 * @param {Array<{ _id: string, name?: string, color?: string }>} [props.labels] - Catalog from GET `/api/labels`.
 * @param {boolean} [props.disabled]
 */
export default function FormFieldLabels({
	formControl,
	schemaProperty,
	labelText = 'Labels',
	placeholder = 'Choose from the list',
	labels = [],
	disabled = false,
}) {
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const selectedIds = Array.isArray(value) ? value.map(String) : [];
				const selected = getLabelsByIds(labels, selectedIds);
				const atCap = selectedIds.length >= MAX_REPORT_LABELS;
				const pickerDisabled = disabled || atCap;

				const removeId = (id) => {
					onChange(selectedIds.filter((current) => current !== String(id)));
				};

				const addId = (id) => {
					const next = String(id);
					if (!next || selectedIds.includes(next) || atCap) return;
					onChange([...selectedIds, next]);
				};

				return (
					<View className="mb-4">
						<FormFieldLabel labelText={labelText} />

						{selected.length > 0 ? (
							<View className="mb-2 flex-row flex-wrap gap-2">
								{selected.map((item) => (
									<LabelChip
										key={String(item._id)}
										name={item.name}
										color={item.color}
										onRemove={disabled ? undefined : () => removeId(item._id)}
									/>
								))}
							</View>
						) : null}

						<Pressable
							onPress={() => setOpen(true)}
							disabled={pickerDisabled}
							className={`flex-row items-center justify-between gap-2 rounded-[10px] border border-input bg-card px-3 py-3 ${pickerDisabled ? 'opacity-50' : ''}`}
							accessibilityRole="button"
							accessibilityLabel={requiredFieldAccessibilityLabel(labelText, false)}
							accessibilityValue={{ text: placeholder }}
							accessibilityState={{ disabled: pickerDisabled }}
						>
							<Text className="min-w-0 flex-1 text-muted-foreground" numberOfLines={1}>
								{placeholder}
							</Text>
							<Icon
								as={ChevronDown}
								className="shrink-0 text-muted-foreground"
								size={16}
							/>
						</Pressable>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}

						<LabelPickerModal
							open={open}
							onOpenChange={setOpen}
							results={labels}
							excludeValues={selectedIds}
							onSelect={addId}
						/>
					</View>
				);
			}}
		/>
	);
}
