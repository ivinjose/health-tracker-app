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

export default function InvestigationCard({
	_id,
	label,
	value,
	unit,
	onEditCb,
	onDeleteCb,
}) {
	const theme = useTheme();
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(
		() => [
			{ label: 'Edit', action: () => onEditCb({ _id, label, value, unit }) },
			{ label: 'Delete', action: () => setShowConfirm(true), variant: 'destructive' },
		],
		[_id, label, value, unit, onEditCb]
	);

	return (
		<View>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					{/* <FlaskConical size={40} color={theme.colors.primary} /> */}
					<View className="flex-1 gap-1">
						<Text className="text-base font-semibold text-foreground">{label}</Text>
						<Text className="text-sm text-muted-foreground">{value}</Text>
						{unit ? (
							<Text className="text-sm text-muted-foreground">{unit}</Text>
						) : null}
					</View>
				</View>
			</CardView>

			<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this investigation. Types that still have reports cannot
							be removed.
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
		</View>
	);
}
