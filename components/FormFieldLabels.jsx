/**
 * Form control for a report’s `labels` field: optional catalog tag ids.
 *
 * Value is a `string[]` of Label `_id`s. Distinct from {@link FormFieldLabel},
 * which only draws a caption, and from {@link FormFieldInvestigation}, which
 * stores one investigation id.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
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
 * @param {string} [props.labelText] - Shown on the left. Chosen labels sit on the right.
 * @param {string} [props.placeholder] - Overrides `labelText` when set (for example a loading state).
 * @param {Array<{ _id: string, name?: string, color?: string }>} [props.labels] - Catalog from GET `/api/labels`.
 * @param {boolean} [props.disabled]
 */
export default function FormFieldLabels({
	formControl,
	schemaProperty,
	labelText = 'Labels',
	placeholder,
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

				const selectedNames = selected.map((item) => item.name).filter(Boolean).join(', ');

				return (
					<View className="border-b border-border">
						<Pressable
							onPress={() => setOpen(true)}
							disabled={pickerDisabled}
							className={`flex-row items-center justify-between gap-2 py-4 ${pickerDisabled ? 'opacity-50' : ''}`}
							accessibilityRole="button"
							accessibilityLabel={requiredFieldAccessibilityLabel(labelText, false)}
							accessibilityValue={{ text: selectedNames || placeholder || labelText }}
							accessibilityState={{ disabled: pickerDisabled }}
						>
							<Text className="shrink-0 text-muted-foreground">{labelText}</Text>
							<View className="min-w-0 flex-1 flex-row flex-wrap items-center justify-end gap-2">
								{selected.length > 0 ? (
									selected.map((item) => (
										<LabelChip
											key={String(item._id)}
											name={item.name}
											color={item.color}
											onRemove={disabled ? undefined : () => removeId(item._id)}
										/>
									))
								) : placeholder ? (
									<Text
										className="min-w-0 shrink text-muted-foreground"
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{placeholder}
									</Text>
								) : null}
							</View>
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
