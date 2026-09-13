import DatePickerCalendar from '@/components/DatePickerCalendar';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function DatePickerField({ enabled, value, onSelect, label, endOfDay = false }) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const [showCalendar, setShowCalendar] = useState(false);
	const dateValue = value ? new Date(Number(value)) : undefined;
	const selectedKey = dateValue ? format(dateValue, 'yyyy-MM-dd') : undefined;
	const maxDate = format(new Date(), 'yyyy-MM-dd');

	const closeCalendar = () => {
		setShowCalendar(false);
	};

	return (
		<View className="gap-2">
			<Label>{label}</Label>
			<View className="flex-row items-center gap-3">
				<Pressable
					onPress={() => enabled && setShowCalendar(true)}
					disabled={!enabled}
					className={`flex-1 flex-row items-center justify-between rounded-lg border border-input px-3 py-3 ${!enabled ? 'opacity-50' : ''}`}
				>
					<Text className={dateValue ? 'text-foreground' : 'text-muted-foreground'}>
						{dateValue ? format(dateValue, 'PP') : 'Pick a date'}
					</Text>
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
							<View className="flex-row items-center justify-between border-b border-border px-4 py-3">
								<Text className="text-lg font-semibold text-foreground">{label}</Text>
								<Button variant="ghost" onPress={closeCalendar}>
									<Text>Done</Text>
								</Button>
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

function FilterEnableRow({ checked, onCheckedChange, label }) {
	return (
		<Pressable
			onPress={() => onCheckedChange(!checked)}
			className="min-h-11 flex-row items-center gap-3"
			accessibilityRole="checkbox"
			accessibilityState={{ checked }}
			accessibilityLabel={label}
		>
			<Checkbox checked={checked} pointerEvents="none" accessible={false} />
			<Text className="flex-1 text-sm text-foreground">{label}</Text>
		</Pressable>
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
	const [fromDateEnabled, setFromDateEnabled] = useState(Boolean(fromDate));
	const [toDateEnabled, setToDateEnabled] = useState(Boolean(toDate));

	const handleFromEnabledChange = (checked) => {
		setFromDateEnabled(checked);
		if (!checked) {
			onFromDateReset();
		}
	};

	const handleToEnabledChange = (checked) => {
		setToDateEnabled(checked);
		if (!checked) {
			onToDateReset();
		}
	};

	return (
		<View className="gap-4">
			<View className="gap-2">
				<FilterEnableRow
					checked={fromDateEnabled}
					onCheckedChange={handleFromEnabledChange}
					label="Click to enable"
				/>
				<DatePickerField
					enabled={fromDateEnabled}
					value={fromDate}
					onSelect={onFromDateSelect}
					label="From Date"
				/>
			</View>

			<View className="gap-2">
				<FilterEnableRow
					checked={toDateEnabled}
					onCheckedChange={handleToEnabledChange}
					label="Click to enable"
				/>
				<DatePickerField
					enabled={toDateEnabled}
					value={toDate}
					onSelect={onToDateSelect}
					label="To Date"
					endOfDay
				/>
			</View>
		</View>
	);
}
