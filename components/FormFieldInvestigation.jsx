/**
 * Form control for a report’s `investigation` field: one catalog investigation id.
 *
 * Value is a string `_id`. For several optional tag ids, use {@link FormFieldLabels}.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import InvestigationPickerModal from '@/components/InvestigationPickerModal';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';

/**
 * Single-select Investigation field: searchable overlay, selected name in the row.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the investigation id.
 * @param {string} [props.labelText] - Shown on the left. The chosen investigation sits on the right.
 * @param {string} [props.placeholder] - Overrides `labelText` when set (for example a loading state).
 * @param {Array<{ _id: string, label?: string }>} [props.investigations] - Catalog from GET `/api/investigations`.
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.required]
 */
export default function FormFieldInvestigation({
	formControl,
	schemaProperty,
	labelText = 'Investigation',
	placeholder,
	investigations = [],
	disabled = false,
	required = false,
}) {
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const currentValue = value != null ? String(value) : '';
				const selected = investigations.find(
					(item) => String(item._id) === currentValue,
				);

				const selectedLabel = selected?.label;

				return (
					<View className="mb-4">
						<Pressable
							onPress={() => setOpen(true)}
							disabled={disabled}
							className={`flex-row items-center justify-between gap-2 rounded-[10px] border border-input bg-card px-3 py-3 ${disabled ? 'opacity-50' : ''}`}
							accessibilityRole="button"
							accessibilityLabel={requiredFieldAccessibilityLabel(
								labelText,
								required
							)}
							accessibilityValue={{ text: selectedLabel ?? placeholder ?? labelText }}
							accessibilityState={{ disabled }}
						>
							<Text className="shrink-0 text-muted-foreground">{labelText}</Text>
							<View className="min-w-0 flex-1 flex-row items-center justify-end">
								{selectedLabel ? (
									<Text
										className="min-w-0 shrink text-foreground"
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{selectedLabel}
									</Text>
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

						<InvestigationPickerModal
							open={open}
							onOpenChange={setOpen}
							results={investigations}
							currentValue={currentValue}
							onSelect={onChange}
						/>
					</View>
				);
			}}
		/>
	);
}
