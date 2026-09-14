import CardView from '@/components/CardView';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { format } from 'date-fns';
import { CalendarPlus, SquarePen } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

export default function AppointmentCard({
	_id,
	location,
	timestamp,
	remarks,
	onDeleteCb,
	isReadOnly = false,
}) {
	const theme = useTheme();
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(() => {
		if (isReadOnly) return [];
		return [{ label: 'Delete', action: () => setShowConfirm(true) }];
	}, [isReadOnly]);

	return (
		<View>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					<CalendarPlus size={40} color={theme.colors.primary} />
					<View className="flex-1 gap-1">
						<Text className="text-base font-semibold text-foreground">{location}</Text>
						<Text className="text-sm text-muted-foreground">
							{format(timestamp, 'MMM dd, yyyy - hh:mm aaa')}
						</Text>
						{remarks ? (
							<Text className="text-sm text-foreground">{remarks}</Text>
						) : null}
						{!isReadOnly ? (
							<Link
								href={{
									pathname: '/(tabs)/reports',
									params: {
										appointment: _id,
										showNewReportDialog: 'true',
									},
								}}
								asChild
							>
								<Pressable className="mt-1 flex-row items-center gap-1">
									<SquarePen size={14} color={theme.colors.primary} />
									<Text className="text-sm text-primary">Link a report</Text>
								</Pressable>
							</Link>
						) : null}
					</View>
				</View>
			</CardView>

			<ConfirmDialog
				open={showConfirm}
				onOpenChange={setShowConfirm}
				description="This will permanently delete this appointment."
				onConfirm={onDelete}
			/>
		</View>
	);
}
