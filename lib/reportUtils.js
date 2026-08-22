import { format } from 'date-fns';

export function withDisplayDates(reports = []) {
	return reports.map((report) => ({
		...report,
		displayDate: report.displayDate ?? format(report.timestamp, 'MMM dd, yyyy'),
		shortDisplayDate: report.shortDisplayDate ?? format(report.timestamp, 'dd/MM/yy'),
	}));
}

export function getInvestigationLabel(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.label ?? investigation;
}

export function getInvestigationUnit(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.unit ?? '';
}
