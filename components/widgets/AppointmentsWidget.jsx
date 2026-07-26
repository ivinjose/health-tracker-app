import WidgetView from '@/components/WidgetView';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { getDateWithoutTime } from '@/lib/helpers';
import useAppointmentsApiManager from '@/api-managers/AppointmentsApiManager';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { format } from 'date-fns';
import { CalendarPlus, SquarePen } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export const APPOINTMENT_TYPE = {
	UPCOMING: 'UPCOMING',
	PAST: 'PAST',
};

export default function AppointmentsWidget({ type = APPOINTMENT_TYPE.UPCOMING, count }) {
	const title = `${type === APPOINTMENT_TYPE.UPCOMING ? 'Upcoming' : 'Past'} appointments`;
	const today = getDateWithoutTime(new Date());
	const appointmentsApiManager = useAppointmentsApiManager();

	const { data: appointments = [], isLoading } = useQuery({
		queryKey: ['appointments-widget', type, count],
		queryFn: async () => {
			const filters = { count };
			if (type === APPOINTMENT_TYPE.UPCOMING) {
				filters.from = `${today.valueOf()}`;
			} else {
				filters.to = `${today.valueOf()}`;
			}
			return appointmentsApiManager.readAppointments(filters);
		},
	});

	return (
		<WidgetView title={title}>
			{isLoading ? (
				<WidgetLoading />
			) : appointments.length > 0 ? (
				<View className="gap-4">
					{appointments.map(({ _id, location, timestamp, remarks }) => (
						<View key={_id} className="gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
							<Text className="font-medium text-foreground">{location}</Text>
							<Text className="text-sm text-muted-foreground">
								{format(timestamp, 'MMM dd, yyyy - hh:mm aaa')}
							</Text>
							{remarks ? <Text className="text-sm text-foreground">{remarks}</Text> : null}
							<Link
								href={{
									pathname: '/(tabs)/reports',
									params: { appointment: _id, showNewReportDialog: 'true' },
								}}
								asChild
							>
								<Pressable className="mt-1 flex-row items-center gap-1">
									<SquarePen size={14} color="#30425f" />
									<Text className="text-sm text-[#30425f]">Link a report</Text>
								</Pressable>
							</Link>
						</View>
					))}
				</View>
			) : (
				<WidgetEmpty type={type} />
			)}
		</WidgetView>
	);
}

function WidgetLoading() {
	return (
		<View className="gap-2">
			<Skeleton className="h-4 w-48" />
			<Skeleton className="h-4 w-32" />
			<Skeleton className="h-4 w-40" />
		</View>
	);
}

function WidgetEmpty({ type }) {
	if (type === APPOINTMENT_TYPE.UPCOMING) {
		return (
			<View className="gap-3">
				<Text className="text-sm text-muted-foreground">
					Looks like you dont have any appointments coming up!
				</Text>
				<Link
					href={{
						pathname: '/(tabs)/appointments',
						params: { showNewAppointmentDialog: 'true' },
					}}
					asChild
				>
					<Pressable className="flex-row items-center gap-1">
						<CalendarPlus size={14} color="#30425f" />
						<Text className="text-sm text-[#30425f]">Create new appointment</Text>
					</Pressable>
				</Link>
			</View>
		);
	}

	return (
		<Text className="text-sm text-muted-foreground">No past appointments to show.</Text>
	);
}
