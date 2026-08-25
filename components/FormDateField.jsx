import DatePickerCalendar from '@/components/DatePickerCalendar';
import { Expanding } from '@/components/ui/expanding';
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
}) {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const selectedDateKey = value ? format(value, 'yyyy-MM-dd') : undefined;

				return (
					<View className="mb-5">
						{labelText ? (
							<Text className="mb-0 text-sm font-medium text-muted-foreground">
								{labelText}
							</Text>
						) : null}
						<Pressable
							onPress={() => setOpen((current) => !current)}
							className="flex-row items-center justify-start gap-2 rounded-[10px] border border-input bg-card px-3 py-3"
							accessibilityRole="button"
							accessibilityState={{ expanded: open }}
							accessibilityLabel={value ? format(value, 'PPP') : 'Pick a date'}
						>
							<CalendarIcon size={24} color={theme.colors.tint} />
							{value ? (
								<Text
									className="text-foreground"
									style={open ? { color: theme.colors.tint } : undefined}
								>
									{format(value, 'PPP')}
								</Text>
							) : (
								<Text
									className="text-muted-foreground"
									style={open ? { color: theme.colors.tint } : undefined}
								>
									Pick a date
								</Text>
							)}
						</Pressable>
						<Expanding open={open}>
							<DatePickerCalendar
								active={open}
								initialDate={selectedDateKey ?? format(new Date(), 'yyyy-MM-dd')}
								minDate={minDate}
								maxDate={maxDate}
								enableSwipeMonths
								markedDates={
									selectedDateKey
										? { [selectedDateKey]: { selected: true } }
										: {}
								}
								onDayPress={(day) => {
									onChange(new Date(day.dateString));
								}}
							/>
						</Expanding>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
