import WidgetView from '@/components/WidgetView';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';

/** Phase 3 will replace this with a real chart (HealthGraph). */
export default function LatestValueWidget({ investigation, count = 1 }) {
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();

	const { data: investigations = [] } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
	});

	const { data: reports = [], isLoading } = useQuery({
		queryKey: ['latest', investigation, count],
		queryFn: () => reportsApiManager.readReports({ investigation, count }),
	});

	const meta = investigations.find((inv) => inv.value === investigation);
	const title = meta?.label ?? investigation.toUpperCase();
	const latest = reports[0];

	return (
		<WidgetView title={title}>
			{isLoading ? (
				<View className="gap-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-24" />
				</View>
			) : latest ? (
				<View className="gap-1">
					<Text className="text-2xl font-semibold text-foreground">
						{latest.value} {meta?.unit ?? ''}
					</Text>
					<Text className="text-sm text-muted-foreground">{latest.displayDate}</Text>
					<Text className="text-xs text-muted-foreground">Chart coming in Phase 3</Text>
				</View>
			) : (
				<Text className="text-sm text-muted-foreground">No readings yet.</Text>
			)}
		</WidgetView>
	);
}
