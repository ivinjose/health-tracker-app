import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ThemeProvider';
import { format } from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const YEARS_PER_PAGE = 12;
const FALLBACK_MIN_YEAR = 1900;
const FALLBACK_MAX_YEAR = 2100;

function yearFromDateKey(dateKey, fallback) {
	if (!dateKey) return fallback;
	return Number(dateKey.slice(0, 4));
}

function pageEndForYear(year, maxYear) {
	const offset = Math.max(0, maxYear - year);
	return maxYear - Math.floor(offset / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

function dateKeyForYear(year, visibleMonthKey, minDateKey, maxDateKey) {
	const month = visibleMonthKey.slice(5, 7);
	const candidate = `${year}-${month}-01`;
	if (maxDateKey && candidate > maxDateKey) return maxDateKey;
	if (minDateKey && candidate < minDateKey) return minDateKey;
	return candidate;
}

function YearPicker({ selectedYear, minYear, maxYear, onSelect, onBack, height }) {
	const theme = useTheme();
	const [pageEnd, setPageEnd] = useState(() => pageEndForYear(selectedYear, maxYear));
	const startYear = pageEnd - YEARS_PER_PAGE + 1;
	const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => startYear + index);
	const canGoBack = startYear > minYear;
	const canGoForward = pageEnd < maxYear;

	return (
		<View style={height ? { height } : undefined}>
			<View className="flex-row items-center justify-between px-2.5 pt-1.5">
				<Pressable
					onPress={() => canGoBack && setPageEnd((current) => current - YEARS_PER_PAGE)}
					disabled={!canGoBack}
					hitSlop={20}
					className="p-2.5"
					accessibilityRole="button"
					accessibilityLabel="Previous years"
				>
					<ChevronLeft size={20} color={canGoBack ? theme.colors.tint : theme.colors.tintDisabled} />
				</Pressable>
				<Pressable
					onPress={onBack}
					className="flex-row items-center gap-1 py-2"
					accessibilityRole="button"
					accessibilityLabel={`${startYear} to ${pageEnd}. Back to calendar`}
				>
					<Text className="text-base font-semibold text-foreground">
						{startYear} – {pageEnd}
					</Text>
					<ChevronUp size={16} color={theme.colors.foreground} />
				</Pressable>
				<Pressable
					onPress={() => canGoForward && setPageEnd((current) => Math.min(current + YEARS_PER_PAGE, maxYear))}
					disabled={!canGoForward}
					hitSlop={20}
					className="p-2.5"
					accessibilityRole="button"
					accessibilityLabel="Next years"
				>
					<ChevronRight size={20} color={canGoForward ? theme.colors.tint : theme.colors.tintDisabled} />
				</Pressable>
			</View>
			<View className="flex-1 flex-row flex-wrap">
				{years.map((year) => {
					const isDisabled = year < minYear || year > maxYear;
					const isSelected = year === selectedYear;
					return (
						<Pressable
							key={year}
							onPress={() => !isDisabled && onSelect(year)}
							disabled={isDisabled}
							style={{ width: '33.333%', height: '25%' }}
							className="items-center justify-center"
							accessibilityRole="button"
							accessibilityState={{ selected: isSelected, disabled: isDisabled }}
							accessibilityLabel={String(year)}
						>
							<View
								className="items-center justify-center rounded-full px-4 py-2"
								style={isSelected ? { backgroundColor: theme.colors.tint } : undefined}
							>
								<Text
									className="text-base"
									style={{
										color: isSelected
											? theme.colors.primaryForeground
											: isDisabled
												? theme.colors.tintDisabled
												: theme.colors.foreground,
									}}
								>
									{year}
								</Text>
							</View>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

export default function DatePickerCalendar({
	active = true,
	initialDate,
	minDate,
	maxDate,
	markedDates,
	onDayPress,
	enableSwipeMonths = false,
	style,
}) {
	const theme = useTheme();
	const todayKey = format(new Date(), 'yyyy-MM-dd');
	const startingDate = initialDate ?? todayKey;
	const initialDateRef = useRef(startingDate);
	initialDateRef.current = startingDate;

	const [pickerMode, setPickerMode] = useState('day');
	const [visibleMonth, setVisibleMonth] = useState(startingDate);
	const [calendarHeight, setCalendarHeight] = useState(0);

	useEffect(() => {
		if (!active) return;
		setPickerMode('day');
		setVisibleMonth(initialDateRef.current);
	}, [active]);

	const minYear = yearFromDateKey(minDate, FALLBACK_MIN_YEAR);
	const maxYear = yearFromDateKey(maxDate, FALLBACK_MAX_YEAR);
	const visibleYear = yearFromDateKey(visibleMonth, maxYear);

	return pickerMode === 'year' ? (
		<YearPicker
			selectedYear={visibleYear}
			minYear={minYear}
			maxYear={maxYear}
			height={calendarHeight}
			onBack={() => setPickerMode('day')}
			onSelect={(year) => {
				setVisibleMonth(dateKeyForYear(year, visibleMonth, minDate, maxDate));
				setPickerMode('day');
			}}
		/>
	) : (
		<View
			onLayout={(event) => {
				const nextHeight = event.nativeEvent.layout.height;
				if (nextHeight > 0 && nextHeight !== calendarHeight) {
					setCalendarHeight(nextHeight);
				}
			}}
		>
			<Calendar
				showSixWeeks
				initialDate={visibleMonth}
				minDate={minDate}
				maxDate={maxDate}
				enableSwipeMonths={enableSwipeMonths}
				disableArrowLeft={Boolean(minDate) && visibleMonth.slice(0, 7) <= minDate.slice(0, 7)}
				disableArrowRight={Boolean(maxDate) && visibleMonth.slice(0, 7) >= maxDate.slice(0, 7)}
				onMonthChange={(month) => {
					setVisibleMonth(month.dateString);
				}}
				renderHeader={(date) => {
					const title = date?.toString?.('MMMM yyyy') ?? '';
					return (
						<Pressable
							onPress={() => setPickerMode('year')}
							className="flex-row items-center gap-1 py-2"
							accessibilityRole="button"
							accessibilityLabel={`${title}. Choose year`}
						>
							<Text className="text-base font-semibold text-foreground">{title}</Text>
							<ChevronDown size={16} color={theme.colors.foreground} />
						</Pressable>
					);
				}}
				onDayPress={onDayPress}
				markedDates={markedDates}
				theme={theme.calendar}
				style={[{ backgroundColor: theme.colors.background }, style]}
			/>
		</View>
	);
}
