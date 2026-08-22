import DateRange from '@/components/DateRange';
import InvestigationSelect from '@/components/InvestigationSelect';
import LineChart from '@/components/charts/LineChart';
import ReportCard from '@/components/ReportCard';
import { Text } from '@/components/ui/text';
import { CARD_LIST_GAP } from '@/constants/layout';
import { SORT_ORDER } from '@/constants/sort';
import { getInvestigationUnit, withDisplayDates } from '@/lib/reportUtils';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

export default function AnalyseScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const investigation = Array.isArray(params.investigation)
		? params.investigation[0]
		: params.investigation;
	const fromParam = Array.isArray(params.from) ? params.from[0] : params.from;
	const toParam = Array.isArray(params.to) ? params.to[0] : params.to;
	const fromDate = fromParam ? Number(fromParam) : undefined;
	const toDate = toParam ? Number(toParam) : undefined;

	const investigationsApiManager = useInvestigationsApiManager();
	const reportsApiManager = useReportsApiManager();

	const updateParams = useCallback(
		(updates) => {
			router.setParams({ ...params, ...updates });
		},
		[params, router]
	);

	const onInvestigationChange = useCallback(
		(newInvestigation) => {
			updateParams({ investigation: newInvestigation });
		},
		[updateParams]
	);

	const clearFromDate = useCallback(() => {
		updateParams({ from: undefined });
	}, [updateParams]);

	const clearToDate = useCallback(() => {
		updateParams({ to: undefined });
	}, [updateParams]);

	const setFromDate = useCallback(
		(date) => {
			updateParams({ from: String(date.valueOf()) });
		},
		[updateParams]
	);

	const setToDate = useCallback(
		(date) => {
			updateParams({ to: String(date.valueOf()) });
		},
		[updateParams]
	);

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
	});

	const { data: reports = [], isLoading: isReportsLoading } = useQuery({
		queryKey: ['reports', fromDate, toDate, investigation],
		queryFn: async () => {
			if (!investigation) return [];
			const response = await reportsApiManager.readReports({
				investigation,
				from: fromDate,
				to: toDate,
				order: SORT_ORDER.DESC,
			});
			return withDisplayDates(response ?? []);
		},
		enabled: Boolean(investigation),
	});

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-muted-foreground">
					Choose an investigation to view trends and history.
				</Text>
				<InvestigationSelect
					results={isInvestigationLoading ? [] : investigations}
					onSelectCb={onInvestigationChange}
					currentValue={investigation}
					labelText="Investigation"
				/>

				{investigation ? (
					<DateRange
						fromDate={fromDate}
						onFromDateSelect={setFromDate}
						onFromDateReset={clearFromDate}
						toDate={toDate}
						onToDateSelect={setToDate}
						onToDateReset={clearToDate}
					/>
				) : null}

				{isReportsLoading ? (
					<Text className="text-muted-foreground">Loading reports…</Text>
				) : reports.length > 0 ? (
					<LineChart
						data={reports}
						xAxisKey="displayDate"
						yAxisKey="value"
						unit={getInvestigationUnit(investigations, investigation)}
					/>
				) : investigation ? (
					<Text className="text-muted-foreground">No reports in this range.</Text>
				) : null}

				{reports.length > 0 ? (
					<View style={{ gap: CARD_LIST_GAP }}>
						{reports.map((report) => (
							<ReportCard
								key={report._id}
								isReadOnly
								investigations={investigations}
								{...report}
							/>
						))}
					</View>
				) : null}
			</ScrollView>
		</View>
	);
}
