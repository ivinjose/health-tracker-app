import CardView from '@/components/CardView';
import { useTheme } from '@/components/ThemeProvider';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function ReportCard({
	_id,
	isReadOnly = false,
	onDeleteCb,
	investigation,
	value,
	displayDate,
	appointments = [],
	remarks,
	filename,
	investigations = [],
}) {
	const theme = useTheme();
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(() => {
		if (isReadOnly) return [];
		return [{ label: 'Delete', action: () => setShowConfirm(true), variant: 'destructive' }];
	}, [isReadOnly]);

	const investigationMeta = useMemo(() => {
		const match = investigations.find((inv) => inv.value === investigation);
		return match ?? { label: investigation ?? 'unknown', unit: '' };
	}, [investigation, investigations]);

	return (
		<>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					{/* TODO Phase 4: Add proper user avatar, hiding this icon till then */}
					{/* <CircleUserRound size={40} color={theme.colors.primary} /> */}
					<View className="flex-1 gap-1">
						<Text className="text-base font-semibold text-foreground">
							{investigationMeta.label} - {value} {investigationMeta.unit}
						</Text>
						{remarks ? <Text className="text-sm text-foreground">{remarks}</Text> : null}
						{appointments.length > 0 ? (
							<Text className="text-sm text-muted-foreground">
								Appointment - {appointments[0].location}
							</Text>
						) : null}
						<View className="mt-1 flex-row items-center justify-between gap-2">
							<Text className="text-sm text-muted-foreground">{displayDate}</Text>
							{filename ? (
								<Text className="text-sm text-muted-foreground">
									{/* TODO Phase 4: ViewReport */}
									Report attached
								</Text>
							) : null}
						</View>
					</View>
				</View>
			</CardView>

			<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your report.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Text>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction onPress={onDelete} className="bg-destructive">
							<Text className="text-destructive-foreground">Continue</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
