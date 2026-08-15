import LineChart from '@/components/charts/LineChart';
import WidgetView from '@/components/WidgetView';
import { useTheme } from '@/components/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { getInvestigationLabel, withDisplayDates } from '@/lib/reportUtils';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export default function HealthGraph({ investigation, count }) {
	const theme = useTheme();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();

	const { data: reports = [], isLoading } = useQuery({
		queryKey: ['reports', investigation, count],
		queryFn: async () => {
			const response = await reportsApiManager.readReports({ investigation, count });
			return withDisplayDates(response ?? []);
		},
	});

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
	});

	const title = isInvestigationLoading
		? investigation
		: getInvestigationLabel(investigations, investigation);

	const footer = (
		<Link href={`/(tabs)/more/analyse-reports/${investigation}`} asChild>
			<Pressable className="flex-row items-center gap-1">
				<Text className="text-sm text-primary">View more</Text>
				<ArrowRight size={14} color={theme.colors.primary} />
			</Pressable>
		</Link>
	);

	return (
		<WidgetView title={title} footer={footer}>
			{isLoading ? (
				<HealthGraphLoading />
			) : reports.length > 0 ? (
				<LineChart data={reports} xAxisKey="displayDate" yAxisKey="value" />
			) : (
				<Text className="text-sm text-muted-foreground">No readings yet.</Text>
			)}
		</WidgetView>
	);
}

function HealthGraphLoading() {
	return (
		<View className="gap-3 py-4">
			<Skeleton className="h-1 w-full" />
			<Skeleton className="h-1 w-full" />
			<Skeleton className="h-1 w-3/4" />
		</View>
	);
}
