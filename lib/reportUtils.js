import { SORT_ORDER } from '@/constants/sort';
import { format } from 'date-fns';

export function withDisplayDates(reports = []) {
	return reports.map((report) => ({
		...report,
		displayDate: report.displayDate ?? format(report.timestamp, 'MMM dd, yyyy'),
		shortDisplayDate: report.shortDisplayDate ?? format(report.timestamp, 'dd/MM/yy'),
	}));
}

export function sortReportsByTimestamp(reports = [], direction = SORT_ORDER.ASC) {
	const multiplier = direction === SORT_ORDER.DESC ? -1 : 1;
	return [...reports].sort((a, b) => {
		const aTime = Number(a?.timestamp);
		const bTime = Number(b?.timestamp);
		if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
		if (Number.isNaN(aTime)) return 1;
		if (Number.isNaN(bTime)) return -1;
		return (aTime - bTime) * multiplier;
	});
}

export function getInvestigationLabel(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.label ?? investigation;
}

export function getInvestigationUnit(investigations = [], investigation) {
	const match = investigations.find((item) => item.value === investigation);
	return match?.unit ?? '';
}
