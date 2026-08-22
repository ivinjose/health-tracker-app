import CompareGraph from '@/components/CompareGraph';
import DateRange from '@/components/DateRange';
import InvestigationSelect from '@/components/InvestigationSelect';
import { Text } from '@/components/ui/text';
import { withDisplayDates } from '@/lib/reportUtils';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

export default function CompareScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();

	const investigation1 = Array.isArray(params.investigation1)
		? params.investigation1[0]
		: params.investigation1;
	const investigation2 = Array.isArray(params.investigation2)
		? params.investigation2[0]
		: params.investigation2;
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

	const onInvestigation1Change = useCallback(
		(investigation) => {
			updateParams({ investigation1: investigation });
		},
		[updateParams]
	);

	const onInvestigation2Change = useCallback(
		(investigation) => {
			updateParams({ investigation2: investigation });
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

	const { data: reports = [], isLoading } = useQuery({
		queryKey: ['compare', fromDate, toDate, investigation1, investigation2],
		queryFn: async () => {
			if (!investigation1 || !investigation2) return [];
			const response = await reportsApiManager.compareReports({
				investigation1,
				investigation2,
				from: fromDate,
				to: toDate,
			});
			return withDisplayDates(response ?? []);
		},
		enabled: Boolean(investigation1 && investigation2),
	});

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				<InvestigationSelect
					results={isInvestigationLoading ? [] : investigations}
					onSelectCb={onInvestigation1Change}
					currentValue={investigation1}
					labelText="Investigation 1"
				/>

				<InvestigationSelect
					results={isInvestigationLoading ? [] : investigations}
					onSelectCb={onInvestigation2Change}
					currentValue={investigation2}
					labelText="Investigation 2"
				/>

				{investigation1 && investigation2 ? (
					<DateRange
						fromDate={fromDate}
						onFromDateSelect={setFromDate}
						onFromDateReset={clearFromDate}
						toDate={toDate}
						onToDateSelect={setToDate}
						onToDateReset={clearToDate}
					/>
				) : null}

				{isLoading ? (
					<Text className="text-muted-foreground">Loading comparison…</Text>
				) : reports.length > 0 ? (
					<CompareGraph
						data={reports}
						investigations={[investigation1, investigation2]}
					/>
				) : investigation1 && investigation2 ? (
					<Text className="text-muted-foreground">No comparison data in this range.</Text>
				) : null}
			</ScrollView>
		</View>
	);
}
