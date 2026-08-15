import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';
import { IOS_DARK_SHEET, useFormSheetAppearance } from '@/components/form-sheet-appearance';
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
	const isDark = useFormSheetAppearance() === 'dark';

	return (
		<Controller
			control={formControl}
			name={name}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const selectedDateKey = value ? format(value, 'yyyy-MM-dd') : undefined;

				return (
					<View className="mb-5">
						{labelText ? (
							<Text
								className={
									isDark
										? 'mb-0 block text-[13px] font-normal text-[#8E8E93]'
										: 'mb-0 block text-base font-normal text-[#4c4c4c]'
								}
							>
								{labelText}
							</Text>
						) : null}
						<Accordion type="single" collapsible>
							<AccordionItem value="date">
								<AccordionTrigger
									className={
										isDark
											? 'flex-row items-center justify-start gap-2 rounded-[10px] bg-[#2C2C2E] px-3 py-3'
											: 'flex-row items-center justify-start gap-2'
									}
								>
									<CalendarIcon
										size={24}
										color={isDark ? IOS_DARK_SHEET.tint : '#000'}
									/>
									{value ? (
										<Text className={isDark ? 'text-white' : undefined}>
											{format(value, 'PPP')}
										</Text>
									) : (
										<Text
											className={
												isDark ? 'text-[#8E8E93]' : undefined
											}
										>
											Pick a date
										</Text>
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
										theme={isDark ? IOS_DARK_SHEET.calendar : undefined}
										style={
											isDark
												? { backgroundColor: IOS_DARK_SHEET.background }
												: undefined
										}
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						{error ? (
							<Text
								className={
									isDark
										? 'mt-1 text-sm text-[#FF453A]'
										: 'mt-1 text-sm text-red-500'
								}
							>
								{error.message}
							</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
