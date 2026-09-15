import CardView from '@/components/CardView';
import ConfirmDialog from '@/components/ConfirmDialog';
import ViewReportDialog from '@/components/ViewReportDialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatInvestigationReading } from '@/lib/investigationUtils';
import { getDisplayDate, getInvestigationLabel, getInvestigationUnit } from '@/lib/reportUtils';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function ReportCard({
	_id,
	isReadOnly = false,
	onEditCb,
	onDeleteCb,
	investigation,
	value,
	displayDate,
	timestamp,
	appointments = [],
	appointment,
	remarks,
	filename,
	investigations = [],
}) {
	const [showConfirm, setShowConfirm] = useState(false);
	const [showViewer, setShowViewer] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(() => {
		if (isReadOnly) return [];
		return [
			{
				label: 'Edit',
				action: () =>
					onEditCb({ _id, investigation, value, timestamp, remarks, appointment, filename }),
			},
			{ label: 'Delete', action: () => setShowConfirm(true), variant: 'destructive' },
		];
	}, [isReadOnly, _id, investigation, value, timestamp, remarks, appointment, filename, onEditCb]);

	const investigationMeta = useMemo(
		() => ({
			label: getInvestigationLabel(investigations, investigation),
			unit: getInvestigationUnit(investigations, investigation),
		}),
		[investigation, investigations]
	);

	const dateLabel = getDisplayDate({ displayDate, timestamp });

	return (
		<View>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					{/* TODO Phase 4: Add proper user avatar, hiding this icon till then */}
					{/* <CircleUserRound size={40} color={theme.colors.primary} /> */}
					<View className="flex-1 gap-1">
						<Text className="text-base font-semibold text-foreground">
							{formatInvestigationReading(
								investigationMeta.label,
								value,
								investigationMeta.unit
							)}
						</Text>
						{remarks ? <Text className="text-sm text-foreground">{remarks}</Text> : null}
						{appointments.length > 0 ? (
							<Text className="text-sm text-muted-foreground">
								Appointment - {appointments[0].location}
							</Text>
						) : null}
						<View className="mt-1 flex-row items-center justify-between gap-2">
							{dateLabel ? (
								<Text className="text-sm text-muted-foreground">{dateLabel}</Text>
							) : null}
							{filename ? (
								<Button
									variant="link"
									size="sm"
									onPress={() => setShowViewer(true)}
									className="h-auto min-h-0 shrink-0 px-0 py-0"
									accessibilityLabel="View report"
								>
									<Text>View report</Text>
								</Button>
							) : null}
						</View>
					</View>
				</View>
			</CardView>

			<ConfirmDialog
				open={showConfirm}
				onOpenChange={setShowConfirm}
				description="This action cannot be undone. This will permanently delete your report."
				destructive
				onConfirm={onDelete}
			/>

			{filename ? (
				<ViewReportDialog
					open={showViewer}
					onOpenChange={setShowViewer}
					filename={filename}
					title={investigationMeta.label}
				/>
			) : null}
		</View>
	);
}
