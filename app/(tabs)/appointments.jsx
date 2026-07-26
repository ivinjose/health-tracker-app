import AppointmentCard from '@/components/AppointmentCard';
import NewAppointmentDialog from '@/components/NewAppointmentDialog';
import CardView from '@/components/CardView';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import useAppointmentsApiManager from '@/api-managers/AppointmentsApiManager';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function AppointmentsScreen() {
	const { showNewAppointmentDialog: showDialogParam } = useLocalSearchParams();
	const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
	const { toast } = useToast();
	const appointmentsApiManager = useAppointmentsApiManager();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (showDialogParam === 'true') {
			setShowNewAppointmentDialog(true);
		}
	}, [showDialogParam]);

	const { data: appointments = [], isLoading } = useQuery({
		queryKey: ['appointments'],
		queryFn: () => appointmentsApiManager.readAppointments({}),
	});

	const { mutateAsync: removeAppointment } = useMutation({
		mutationFn: (data) => appointmentsApiManager.deleteAppointment(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['appointments'] });
			await queryClient.invalidateQueries({ queryKey: ['appointments-widget'] });
			toast({ description: 'Your appointment was deleted successfully!' });
		},
	});

	return (
		<View className="flex-1 bg-background">
			<PageHeader text="Manage Appointments" />
			<View className="px-4 py-3">
				<Button onPress={() => setShowNewAppointmentDialog(true)}>
					<Plus size={18} color="#fff" />
					<Text className="ml-2 font-medium text-primary-foreground">New appointment</Text>
				</Button>
			</View>

			{isLoading ? (
				<AppointmentsLoading />
			) : appointments.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No appointments yet.</Text>
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
					{appointments.map((appointment) => (
						<AppointmentCard
							key={appointment._id}
							onDeleteCb={removeAppointment}
							{...appointment}
						/>
					))}
				</ScrollView>
			)}

			<NewAppointmentDialog
				open={showNewAppointmentDialog}
				onOpenChange={setShowNewAppointmentDialog}
			/>
		</View>
	);
}

function AppointmentsLoading() {
	return (
		<View className="p-4">
			<CardView actions={[]}>
				<View className="flex-row gap-4 p-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<View className="flex-1 gap-2">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-40" />
					</View>
				</View>
			</CardView>
		</View>
	);
}
