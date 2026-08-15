import { createContext, useContext } from 'react';

export const IOS_DARK_SHEET = {
	background: '#1C1C1E',
	field: '#2C2C2E',
	fieldBorder: '#3A3A3C',
	label: '#FFFFFF',
	secondaryLabel: '#8E8E93',
	placeholder: '#8E8E93',
	tint: '#0A84FF',
	tintDisabled: '#636366',
	close: '#8E8E93',
	error: '#FF453A',
	calendar: {
		backgroundColor: '#1C1C1E',
		calendarBackground: '#1C1C1E',
		textSectionTitleColor: '#8E8E93',
		selectedDayBackgroundColor: '#0A84FF',
		selectedDayTextColor: '#ffffff',
		todayTextColor: '#0A84FF',
		dayTextColor: '#ffffff',
		textDisabledColor: '#636366',
		monthTextColor: '#ffffff',
		arrowColor: '#0A84FF',
		indicatorColor: '#0A84FF',
	},
};

export const FormSheetAppearanceContext = createContext('light');

export function useFormSheetAppearance() {
	return useContext(FormSheetAppearanceContext);
}
