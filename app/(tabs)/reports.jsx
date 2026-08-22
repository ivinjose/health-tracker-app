import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import NewReportDialog from '@/components/NewReportDialog';
import ReportCard from '@/components/ReportCard';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { SORT_ORDER } from '@/constants/sort';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function ReportsScreen() {
	const theme = useTheme();
	const { showNewReportDialog: showDialogParam, appointment } = useLocalSearchParams();
	const appointmentId = Array.isArray(appointment) ? appointment[0] : appointment;
	const [showNewReportDialog, setShowNewReportDialog] = useState(false);
	const { toast } = useToast();
	const reportsApiManager = useReportsApiManager();
	const investigationsApiManager = useInvestigationsApiManager();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (showDialogParam === 'true') {
			setShowNewReportDialog(true);
		}
	}, [showDialogParam]);

	const {
		data: reports = [],
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['reports'],
		queryFn: () => reportsApiManager.readReports({ order: SORT_ORDER.DESC }),
	});

	const { data: investigations = [] } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
	});

	const { mutateAsync: removeReport } = useMutation({
		mutationFn: (data) => reportsApiManager.deleteReport(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['reports'] });
			await queryClient.invalidateQueries({ queryKey: ['latest'] });
			toast({ description: 'Your report was deleted successfully!' });
		},
	});

	return (
		<View className="flex-1 bg-background">
			{isLoading ? (
				<View className="gap-4 p-4">
					<Skeleton className="h-24 w-full rounded-[10px] bg-card" />
					<Skeleton className="h-24 w-full rounded-[10px] bg-card" />
				</View>
			) : isError ? (
				<View className="flex-1 items-center justify-center gap-3 px-6">
					<Text className="text-center text-destructive">Could not load reports.</Text>
					<Button variant="outline" onPress={() => refetch()}>
						<Text>Try again</Text>
					</Button>
				</View>
			) : reports.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No reports yet.</Text>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 8 }}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={theme.colors.mutedForeground}
							colors={[theme.colors.tint]}
						/>
					}
				>
					{reports.map((report) => (
						<ReportCard
							key={report._id}
							onDeleteCb={removeReport}
							investigations={investigations}
							{...report}
						/>
					))}
				</ScrollView>
			)}

			<Pressable
				onPress={() => setShowNewReportDialog(true)}
				accessibilityRole="button"
				accessibilityLabel="New report"
				className="absolute bottom-6 right-5 z-10 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 3 },
					shadowOpacity: 0.35,
					shadowRadius: 6,
					elevation: 6,
				}}
			>
				<Plus size={28} color={theme.colors.primaryForeground} strokeWidth={2.5} />
			</Pressable>

			<NewReportDialog
				open={showNewReportDialog}
				onOpenChange={setShowNewReportDialog}
				appointmentId={appointmentId}
			/>
		</View>
	);
}
