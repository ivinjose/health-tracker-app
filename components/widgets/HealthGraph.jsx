import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import ChartExpandButton from '@/components/charts/ChartExpandButton';
import ChartExpandDialog from '@/components/charts/ChartExpandDialog';
import LineChart from '@/components/charts/LineChart';
import { useTheme } from '@/components/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import WidgetView from '@/components/WidgetView';
import { SORT_ORDER } from '@/constants/sort';
import {
	getInvestigationLabel,
	getInvestigationUnit,
	sortReportsByTimestamp,
	withDisplayDates,
} from '@/lib/reportUtils';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

export default function HealthGraph({ investigation, count, onRemove }) {
	const theme = useTheme();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();
	const [expandOpen, setExpandOpen] = useState(false);

	const { data: reports = [], isLoading } = useQuery({
		queryKey: ['reports', investigation, count],
		queryFn: async () => {
			const response = await reportsApiManager.readReports({ investigation, count });
			return sortReportsByTimestamp(response ?? [], SORT_ORDER.ASC);
		},
	});

	const { data: expandedReports = [], isLoading: isExpandLoading } = useQuery({
		queryKey: ['reports', undefined, undefined, investigation],
		queryFn: async () => {
			const response = await reportsApiManager.readReports({ investigation });
			return sortReportsByTimestamp(withDisplayDates(response ?? []), SORT_ORDER.ASC);
		},
		enabled: expandOpen && Boolean(investigation),
	});

	const { data: investigations = [], isLoading: isInvestigationLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations(),
	});

	const title = isInvestigationLoading
		? ''
		: getInvestigationLabel(investigations, investigation);
	const unit = getInvestigationUnit(investigations, investigation);

	const footer = (
		<Link
			href={{ pathname: '/(tabs)/analyse', params: { investigation } }}
			asChild
		>
			<Pressable className="flex-row items-center gap-1 self-end">
				<Text className="text-sm text-primary">Analyse</Text>
				<ArrowRight size={14} color={theme.colors.primary} />
			</Pressable>
		</Link>
	);

	const removeButton = onRemove ? (
		<Pressable
			onPress={onRemove}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel={`Remove ${title} from overview`}
		>
			<X size={18} color={theme.colors.mutedForeground} />
		</Pressable>
	) : null;

	const headerRight =
		reports.length > 0 || removeButton ? (
			<View className="flex-row items-center">
				{reports.length > 0 ? (
					<ChartExpandButton onPress={() => setExpandOpen(true)} />
				) : null}
				{removeButton}
			</View>
		) : null;

	return (
		<WidgetView title={title} footer={footer} headerRight={headerRight}>
			{isLoading ? (
				<HealthGraphLoading />
			) : reports.length > 0 ? (
				<LineChart data={reports} unit={unit} showNodeValues />
			) : (
				<Text className="text-sm text-muted-foreground">No readings yet.</Text>
			)}
			<ChartExpandDialog
				open={expandOpen}
				onOpenChange={setExpandOpen}
				title={title}
				data={expandedReports}
				isLoading={expandOpen && isExpandLoading}
				unit={unit}
			/>
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
