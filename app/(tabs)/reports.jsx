import NewReportDialog from '@/components/NewReportDialog';
import PageHeader from '@/components/PageHeader';
import ReportCard from '@/components/ReportCard';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import useReportsApiManager from '@/api-managers/ReportsApiManager';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function ReportsScreen() {
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

	const { data: reports = [], isLoading } = useQuery({
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
		<View className="flex-1 bg-background">
			<PageHeader text="Manage reports" />
			<View className="px-4 py-3">
				<Button onPress={() => setShowNewReportDialog(true)}>
					<Plus size={18} color="#fff" />
					<Text className="ml-2 font-medium text-primary-foreground">New report</Text>
				</Button>
			</View>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">Loading reports…</Text>
				</View>
			) : reports.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No reports yet.</Text>
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
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
	);
}
