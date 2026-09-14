import DatePickerCalendar from '@/components/DatePickerCalendar';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function dateFromDay(day) {
	const parsed = new Date(day.dateString);
	return Number.isNaN(parsed.getTime()) ? new Date(day.timestamp) : parsed;
}

export default function DatePickerSheet({
	open,
	onOpenChange,
	title,
	value,
	minDate,
	maxDate,
	onSelect,
	onClear,
	enableSwipeMonths = false,
}) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const close = () => onOpenChange(false);
	const selectedKey = value ? format(value, 'yyyy-MM-dd') : undefined;

	return (
		<Modal visible={open} transparent animationType="slide" onRequestClose={close}>
			<ThemeProvider appearance={theme.name} className="flex-1">
				<Pressable className="flex-1 justify-end bg-black/50" onPress={close}>
					<Pressable
						className="rounded-t-2xl bg-background"
						style={{ paddingBottom: insets.bottom }}
						onPress={(event) => event.stopPropagation()}
					>
						<View className="flex-row items-center border-b border-border px-2 py-3">
							<View className="w-20">
								{onClear && value ? (
									<Button
										variant="ghost"
										onPress={() => {
											onClear();
											close();
										}}
									>
										<Text>Clear</Text>
									</Button>
								) : null}
							</View>
							<Text
								className="flex-1 text-center text-lg font-semibold text-foreground"
								numberOfLines={1}
							>
								{title}
							</Text>
							<View className="w-20 items-end">
								<Button variant="ghost" onPress={close}>
									<Text>Done</Text>
								</Button>
							</View>
						</View>
						<DatePickerCalendar
							active={open}
							initialDate={selectedKey ?? maxDate ?? format(new Date(), 'yyyy-MM-dd')}
							minDate={minDate}
							maxDate={maxDate}
							enableSwipeMonths={enableSwipeMonths}
							markedDates={
								selectedKey ? { [selectedKey]: { selected: true } } : undefined
							}
							onDayPress={(day) => {
								onSelect(dateFromDay(day));
								close();
							}}
						/>
					</Pressable>
				</Pressable>
			</ThemeProvider>
		</Modal>
	);
}
