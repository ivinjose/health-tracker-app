import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

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
					<View className="mb-5">
						{labelText ? (
							<Text className="mb-0 block text-base font-normal text-[#4c4c4c]">
								{labelText}
							</Text>
						) : null}
						<Accordion type="single" collapsible>
							<AccordionItem value="date">
								<AccordionTrigger className="flex-row items-center justify-start gap-2">
									<CalendarIcon size={24} color="#000" />
									{value ? (
										<Text>{format(value, 'PPP')}</Text>
									) : (
										<Text>Pick a date</Text>
									)}
								</AccordionTrigger>
								<AccordionContent>
									<Calendar
										initialDate={
											selectedDateKey ?? format(new Date(), 'yyyy-MM-dd')
										}
										enableSwipeMonths
										minDate={minDate}
										maxDate={maxDate}
										markedDates={
											selectedDateKey
												? { [selectedDateKey]: { selected: true } }
												: {}
										}
										onDayPress={(day) => {
											onChange(new Date(day.dateString));
										}}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						{error ? (
							<Text className="mt-1 text-sm text-red-500">{error.message}</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
