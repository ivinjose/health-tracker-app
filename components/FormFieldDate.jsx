/**
 * Form control for a date value (typically a report’s sample-collection `date`).
 *
 * Value is a `Date`. Not used for investigation or catalog labels.
 */
import DatePickerSheet from '@/components/DatePickerSheet';
import { requiredFieldAccessibilityLabel } from '@/components/FormFieldLabel';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ThemeProvider';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';

/**
 * Date field: opens {@link DatePickerSheet} and stores a `Date` on the form.
 *
 * @param {object} props
 * @param {object} props.formControl - react-hook-form `control`.
 * @param {string} props.name - Form path (`date`).
 * @param {string} [props.labelText] - Shown on the left. The chosen date sits on the right.
 * @param {string} [props.minDate]
 * @param {string} [props.maxDate]
 * @param {boolean} [props.required]
 * @param {string} [props.dateFormat] - `date-fns` format for the closed field. Defaults to the long form (`PPP`).
 */
export default function FormFieldDate({
	formControl,
	name,
	labelText,
	minDate,
	maxDate,
	required = false,
	dateFormat = 'PPP',
}) {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const hint = labelText || 'Pick a date';
				const formatted = value ? format(value, dateFormat) : '';

				return (
					<View className="mb-4">
						<Pressable
							onPress={() => setOpen(true)}
							className="flex-row items-center justify-between gap-2 rounded-[10px] border border-input bg-card px-3 py-3"
							accessibilityRole="button"
							accessibilityLabel={
								requiredFieldAccessibilityLabel(labelText, required) ?? 'Date'
							}
							accessibilityValue={{
								text: formatted || hint,
							}}
						>
							<Text className="shrink-0 text-muted-foreground">{hint}</Text>
							<View className="min-w-0 flex-1 flex-row items-center justify-end">
								{formatted ? (
									<Text
										className="min-w-0 shrink text-foreground"
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{formatted}
									</Text>
								) : null}
							</View>
							<CalendarIcon size={16} color={theme.colors.tint} />
						</Pressable>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}

						<DatePickerSheet
							open={open}
							onOpenChange={setOpen}
							title={labelText ?? 'Pick a date'}
							value={value}
							minDate={minDate}
							maxDate={maxDate}
							onSelect={onChange}
							enableSwipeMonths
						/>
					</View>
				);
			}}
		/>
	);
}
