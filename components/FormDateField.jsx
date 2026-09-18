import DatePickerSheet from '@/components/DatePickerSheet';
import FormFieldLabel, {
	requiredFieldAccessibilityLabel,
} from '@/components/FormFieldLabel';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ThemeProvider';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';

export default function FormDateField({
	formControl,
	name,
	labelText,
	minDate,
	maxDate,
	required = false,
}) {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => (
				<View className="mb-4">
					<FormFieldLabel labelText={labelText} required={required} />
					<Pressable
						onPress={() => setOpen(true)}
						className="flex-row items-center justify-start gap-2 rounded-[10px] border border-input bg-card px-3 py-3"
						accessibilityRole="button"
						accessibilityLabel={
							requiredFieldAccessibilityLabel(labelText, required) ?? 'Date'
						}
						accessibilityValue={{
							text: value ? format(value, 'PPP') : 'Pick a date',
						}}
					>
						<CalendarIcon size={24} color={theme.colors.tint} />
						<Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
							{value ? format(value, 'PPP') : 'Pick a date'}
						</Text>
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
			)}
		/>
	);
}
