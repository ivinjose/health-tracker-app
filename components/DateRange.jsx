import DatePickerSheet from '@/components/DatePickerSheet';
import { useTheme } from '@/components/ThemeProvider';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

const END_OF_DAY_OFFSET = 24 * 60 * 60 * 1000 - 1;

function DatePickerField({
	value,
	onSelect,
	onClear,
	label,
	clearAccessibilityLabel,
	endOfDay = false,
}) {
	const theme = useTheme();
	const [showCalendar, setShowCalendar] = useState(false);
	const dateValue = value ? new Date(Number(value)) : undefined;
	const maxDate = format(new Date(), 'yyyy-MM-dd');

	const openCalendar = () => {
		setShowCalendar(true);
	};

	return (
		<View className="gap-2">
			<Label>{label}</Label>
			<View className="flex-row items-center rounded-lg border border-input bg-card">
				<Pressable
					onPress={openCalendar}
					className="min-h-11 flex-1 flex-row items-center gap-2 px-3 py-3"
					accessibilityRole="button"
					accessibilityLabel={
						dateValue ? `${label}, ${format(dateValue, 'PP')}` : `${label}, Pick a date`
					}
				>
					<CalendarIcon size={24} color={theme.colors.tint} />
					<Text className={dateValue ? 'text-foreground' : 'text-muted-foreground'}>
						{dateValue ? format(dateValue, 'PP') : 'Pick a date'}
					</Text>
				</Pressable>
				{dateValue ? (
					<Pressable
						onPress={onClear}
						className="h-11 w-11 items-center justify-center"
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel={clearAccessibilityLabel}
					>
						<Trash2 size={18} color={theme.colors.destructive} />
					</Pressable>
				) : null}
			</View>

			<DatePickerSheet
				open={showCalendar}
				onOpenChange={setShowCalendar}
				title={label}
				value={dateValue}
				maxDate={maxDate}
				onSelect={(date) =>
					onSelect(endOfDay ? new Date(date.getTime() + END_OF_DAY_OFFSET) : date)
				}
				onClear={onClear}
			/>
		</View>
	);
}

export default function DateRange({
	fromDate,
	onFromDateSelect,
	onFromDateReset,
	toDate,
	onToDateSelect,
	onToDateReset,
}) {
	return (
		<View className="gap-4">
			<DatePickerField
				value={fromDate}
				onSelect={onFromDateSelect}
				onClear={onFromDateReset}
				label="From Date"
				clearAccessibilityLabel="Clear from date"
			/>
			<DatePickerField
				value={toDate}
				onSelect={onToDateSelect}
				onClear={onToDateReset}
				label="To Date"
				clearAccessibilityLabel="Clear to date"
				endOfDay
			/>
		</View>
	);
}
