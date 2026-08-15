import CardView from '@/components/CardView';
import { IOS_DARK_SHEET, useFormSheetAppearance } from '@/components/form-sheet-appearance';
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
import { CircleUserRound } from 'lucide-react-native';
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
	const isDark = useFormSheetAppearance() === 'dark';
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
					<CircleUserRound
						size={40}
						color={isDark ? IOS_DARK_SHEET.tint : '#30425f'}
					/>
					<View className="flex-1 gap-1">
						<Text
							className={
								isDark
									? 'text-base font-semibold text-white'
									: 'text-base font-semibold text-foreground'
							}
						>
							{investigationMeta.label} - {value} {investigationMeta.unit}
						</Text>
						{remarks ? (
							<Text className={isDark ? 'text-sm text-white' : 'text-sm text-foreground'}>
								{remarks}
							</Text>
						) : null}
						{appointments.length > 0 ? (
							<Text
								className={
									isDark
										? 'text-sm text-[#8E8E93]'
										: 'text-sm text-muted-foreground'
								}
							>
								Appointment - {appointments[0].location}
							</Text>
						) : null}
						<View className="mt-1 flex-row items-center justify-between gap-2">
							<Text
								className={
									isDark
										? 'text-sm text-[#8E8E93]'
										: 'text-sm text-muted-foreground'
								}
							>
								{displayDate}
							</Text>
							{filename ? (
								<Text
									className={
										isDark
											? 'text-sm text-[#8E8E93]'
											: 'text-sm text-muted-foreground'
									}
								>
									{/* TODO Phase 4: ViewReport */}
									Report attached
								</Text>
							) : null}
						</View>
					</View>
				</View>
			</CardView>

			<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
				<AlertDialogContent
					className={isDark ? 'border-[#3A3A3C] bg-[#2C2C2E]' : undefined}
				>
					<AlertDialogHeader>
						<AlertDialogTitle className={isDark ? 'text-white' : undefined}>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription
							className={isDark ? 'text-[#8E8E93]' : undefined}
						>
							This action cannot be undone. This will permanently delete your report.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className={
								isDark ? 'border-[#3A3A3C] bg-[#2C2C2E]' : undefined
							}
						>
							<Text className={isDark ? 'text-white' : undefined}>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction
							onPress={onDelete}
							className={isDark ? 'bg-[#FF453A]' : undefined}
						>
							<Text className={isDark ? 'text-white' : undefined}>Continue</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
