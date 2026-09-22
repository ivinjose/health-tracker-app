/**
 * Form control for a report’s `remarks` field: compact row that opens a full-height editor sheet.
 */
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import FormSheetModal from '@/components/FormSheetModal';
import { useTheme } from '@/components/ThemeProvider';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Keyboard, Pressable, TextInput, View } from 'react-native';

const FOCUS_DELAY_MS = 400;

/**
 * Remarks field: one-line row that opens a stacked sheet with a focused text area.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.schemaProperty - Form path for the string (`remarks`).
 * @param {string} [props.labelText]
 * @param {string} [props.placeholder]
 * @param {boolean} [props.disabled]
 */
export default function FormFieldRemarks({
	formControl,
	schemaProperty,
	labelText = 'Remarks',
	placeholder = 'Enter any details you want to remember or note',
	disabled = false,
}) {
	const theme = useTheme();
	const [open, setOpen] = useState(false);
	const inputRef = useRef(null);

	useEffect(() => {
		if (!open) return undefined;

		const id = setTimeout(() => {
			inputRef.current?.focus();
		}, FOCUS_DELAY_MS);

		return () => clearTimeout(id);
	}, [open]);

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
				const text = typeof value === 'string' ? value : '';
				const preview = text.trim();

				const handleOpenChange = (nextOpen) => {
					setOpen(nextOpen);
					if (!nextOpen) onBlur();
				};

				return (
					<View className="mb-4">
						<Pressable
							onPress={() => {
								Keyboard.dismiss();
								setOpen(true);
							}}
							disabled={disabled}
							className={`flex-row items-center justify-between gap-2 rounded-[10px] border border-input bg-card px-3 py-3 ${disabled ? 'opacity-50' : ''}`}
							accessibilityRole="button"
							accessibilityLabel={requiredFieldAccessibilityLabel(labelText, false)}
							accessibilityValue={{ text: preview || labelText }}
							accessibilityState={{ disabled }}
						>
							<Text
								className="min-w-0 flex-1 text-foreground"
								numberOfLines={1}
							>
								{preview || labelText}
							</Text>
							<Icon
								as={ChevronRight}
								className="shrink-0 text-muted-foreground"
								size={16}
							/>
						</Pressable>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}

						<FormSheetModal
							open={open}
							onOpenChange={handleOpenChange}
							title={labelText}
							scrollable={false}
							dismissIcon="back"
							avoidKeyboard
						>
							<TextInput
								ref={inputRef}
								className="text-base leading-tight text-foreground"
								style={{ flex: 1 }}
								placeholder={placeholder}
								placeholderTextColor={theme.colors.placeholder}
								value={text}
								onChangeText={onChange}
								onBlur={onBlur}
								multiline
								textAlignVertical="top"
								keyboardAppearance={theme.keyboardAppearance}
								selectionColor={theme.colors.tint}
							/>
						</FormSheetModal>
					</View>
				);
			}}
		/>
	);
}
