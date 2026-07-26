import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Modal, Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FormDateField({
	formControl,
	name,
	labelText,
	minDate,
	maxDate,
}) {
	const insets = useSafeAreaInsets();
	const [showCalendar, setShowCalendar] = useState(false);

	return (
		<Controller
			control={formControl}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const selectedDateKey = value ? format(value, 'yyyy-MM-dd') : undefined;

				return (
					<View className="mb-4">
						{labelText ? (
							<Text className="mb-1 text-base font-medium text-foreground">{labelText}</Text>
						) : null}
						<Pressable
							onPress={() => setShowCalendar(true)}
							className="flex-row items-center justify-between rounded-lg border border-gray-300 px-3 py-3"
						>
							<Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
								{value ? format(value, 'PPP') : 'Pick a date'}
							</Text>
							<CalendarIcon size={18} color="#6b7280" />
						</Pressable>

						<Modal visible={showCalendar} transparent animationType="slide">
							<Pressable
								className="flex-1 justify-end bg-black/50"
								onPress={() => setShowCalendar(false)}
							>
								<Pressable
									className="rounded-t-2xl bg-background"
									style={{ paddingBottom: insets.bottom }}
									onPress={(e) => e.stopPropagation()}
								>
									<View className="flex-row items-center justify-between border-b border-border px-4 py-3">
										<Text className="text-lg font-semibold">Select date</Text>
										<Button variant="ghost" onPress={() => setShowCalendar(false)}>
											<Text>Done</Text>
										</Button>
									</View>
									<Calendar
										onDayPress={(day) => {
											onChange(new Date(day.timestamp));
											setShowCalendar(false);
										}}
										markedDates={
											selectedDateKey
												? { [selectedDateKey]: { selected: true } }
												: undefined
										}
										minDate={minDate}
										maxDate={maxDate}
									/>
								</Pressable>
							</Pressable>
						</Modal>

						{error ? (
							<Text className="mt-1 text-sm text-red-500">{error.message}</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
