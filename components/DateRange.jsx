import DatePickerCalendar from '@/components/DatePickerCalendar';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CircleX } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function DatePickerField({
	value,
	onSelect,
	onClear,
	label,
	clearAccessibilityLabel,
	endOfDay = false,
}) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const [showCalendar, setShowCalendar] = useState(false);
	const dateValue = value ? new Date(Number(value)) : undefined;
	const selectedKey = dateValue ? format(dateValue, 'yyyy-MM-dd') : undefined;
	const maxDate = format(new Date(), 'yyyy-MM-dd');

	const openCalendar = () => {
		setShowCalendar(true);
	};

	const closeCalendar = () => {
		setShowCalendar(false);
	};

	const handleClear = () => {
		onClear();
		closeCalendar();
	};

	return (
		<View className="gap-2">
			<Label>{label}</Label>
			<View className="flex-row items-center rounded-lg border border-input">
				<Pressable
					onPress={openCalendar}
					className="min-h-11 flex-1 justify-center px-3 py-3"
					accessibilityRole="button"
					accessibilityLabel={
						dateValue ? `${label}, ${format(dateValue, 'PP')}` : `${label}, Pick a date`
					}
				>
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
						<CircleX size={18} color={theme.colors.close} />
					</Pressable>
				) : null}
				<Pressable
					onPress={openCalendar}
					className="h-11 w-11 items-center justify-center"
					hitSlop={8}
					accessibilityRole="button"
					accessibilityLabel={`${label} calendar`}
				>
					<CalendarIcon size={18} color={theme.colors.mutedForeground} />
				</Pressable>
			</View>

			<Modal visible={showCalendar} transparent animationType="slide">
				<ThemeProvider appearance={theme.name} className="flex-1">
					<Pressable
						className="flex-1 justify-end bg-black/50"
						onPress={closeCalendar}
					>
						<Pressable
							className="rounded-t-2xl bg-background"
							style={{ paddingBottom: insets.bottom }}
							onPress={(event) => event.stopPropagation()}
						>
							<View className="flex-row items-center border-b border-border px-2 py-3">
								<View className="w-20">
									{dateValue ? (
										<Button variant="ghost" onPress={handleClear}>
											<Text>Clear</Text>
										</Button>
									) : null}
								</View>
								<Text className="flex-1 text-center text-lg font-semibold text-foreground">
									{label}
								</Text>
								<View className="w-20 items-end">
									<Button variant="ghost" onPress={closeCalendar}>
										<Text>Done</Text>
									</Button>
								</View>
							</View>
							<DatePickerCalendar
								active={showCalendar}
								initialDate={selectedKey ?? maxDate}
								maxDate={maxDate}
								markedDates={
									selectedKey ? { [selectedKey]: { selected: true } } : undefined
								}
								onDayPress={(day) => {
									const parsed = new Date(day.dateString);
									const start = Number.isNaN(parsed.getTime())
										? new Date(day.timestamp)
										: parsed;
									onSelect(endOfDay
										? new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
										: start);
									closeCalendar();
								}}
							/>
						</Pressable>
					</Pressable>
				</ThemeProvider>
			</Modal>
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
