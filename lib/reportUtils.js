import { format } from 'date-fns';

export function withDisplayDates(reports = []) {
	return reports.map((report) => ({
		...report,
		displayDate: report.displayDate ?? format(report.timestamp, 'MMM dd, yyyy'),
	}));
}

export function getInvestigationLabel(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.label ?? investigation;
}
