import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import NewReportDialog from '@/components/NewReportDialog';
import ReportCard from '@/components/ReportCard';
import {
	FormSheetAppearanceContext,
	IOS_DARK_SHEET,
} from '@/components/form-sheet-appearance';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function ReportsScreen() {
	const isFocused = useIsFocused();
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
		queryFn: () => reportsApiManager.readReports({}),
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
		<FormSheetAppearanceContext.Provider value="dark">
			{isFocused ? <StatusBar style="light" /> : null}
			<View className="flex-1 bg-[#1C1C1E]">
				<View className="px-4 py-3">
					<Button
						onPress={() => setShowNewReportDialog(true)}
						className="h-11 rounded-[10px] bg-[#0A84FF] shadow-none"
					>
						<Plus size={18} color="#fff" />
						<Text className="ml-2 font-medium text-white">New report</Text>
					</Button>
				</View>

				{isLoading ? (
					<View className="gap-4 p-4">
						<Skeleton className="h-24 w-full rounded-[10px] bg-[#2C2C2E]" />
						<Skeleton className="h-24 w-full rounded-[10px] bg-[#2C2C2E]" />
					</View>
				) : isError ? (
					<View className="flex-1 items-center justify-center gap-3 px-6">
						<Text className="text-center text-[#FF453A]">Could not load reports.</Text>
						<Button
							variant="outline"
							onPress={() => refetch()}
							className="border-[#3A3A3C] bg-[#2C2C2E]"
						>
							<Text className="text-white">Try again</Text>
						</Button>
					</View>
				) : reports.length === 0 ? (
					<View className="flex-1 items-center justify-center gap-4 px-6">
						<Text className="text-center text-[#8E8E93]">No reports yet.</Text>
						<Button
							onPress={() => setShowNewReportDialog(true)}
							className="h-11 rounded-[10px] bg-[#0A84FF] shadow-none"
						>
							<Text className="font-medium text-white">Create report</Text>
						</Button>
					</View>
				) : (
					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 16, gap: 16 }}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								tintColor={IOS_DARK_SHEET.secondaryLabel}
								colors={[IOS_DARK_SHEET.tint]}
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

				<NewReportDialog
					open={showNewReportDialog}
					onOpenChange={setShowNewReportDialog}
					appointmentId={appointmentId}
				/>
			</View>
		</FormSheetAppearanceContext.Provider>
	);
}
