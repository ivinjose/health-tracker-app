import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';
import * as PopoverPrimitive from '@rn-primitives/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

function CalendarPicker({ selectedDateKey, minDate, maxDate, onSelect }) {
	const { onOpenChange } = PopoverPrimitive.useRootContext();

	return (
		<Calendar
			onDayPress={(day) => {
				onSelect(new Date(day.timestamp));
				onOpenChange(false);
			}}
			markedDates={
				selectedDateKey ? { [selectedDateKey]: { selected: true } } : undefined
			}
			minDate={minDate}
			maxDate={maxDate}
		/>
	);
}

export default function FormDateField({
	formControl,
	name,
	labelText,
	minDate,
	maxDate,
}) {
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
						<Popover>
							<PopoverTrigger asChild>
								<Pressable className="flex-row items-center justify-between rounded-lg border border-gray-300 px-3 py-3">
									<Text className={value ? 'text-foreground' : 'text-muted-foreground'}>
										{value ? format(value, 'PPP') : 'Pick a date'}
									</Text>
									<CalendarIcon size={18} color="#6b7280" />
								</Pressable>
							</PopoverTrigger>
							<PopoverContent
								className="w-[min(100vw-2rem,400px)] p-0"
								align="start"
								side="bottom"
								sideOffset={8}
							>
								<View className="flex-row items-center justify-between border-b border-border px-4 py-3">
									<Text className="text-lg font-semibold">Select date</Text>
									<PopoverPrimitive.Close asChild>
										<Button variant="ghost">
											<Text>Done</Text>
										</Button>
									</PopoverPrimitive.Close>
								</View>
								<CalendarPicker
									selectedDateKey={selectedDateKey}
									minDate={minDate}
									maxDate={maxDate}
									onSelect={onChange}
								/>
							</PopoverContent>
						</Popover>

						{error ? (
							<Text className="mt-1 text-sm text-red-500">{error.message}</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
