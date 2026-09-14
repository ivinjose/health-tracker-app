import CardView from '@/components/CardView';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Text } from '@/components/ui/text';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function InvestigationCard({
	_id,
	label,
	unit,
	onEditCb,
	onDeleteCb,
}) {
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(
		() => [
			{ label: 'Edit', action: () => onEditCb({ _id, label, unit }) },
			{ label: 'Delete', action: () => setShowConfirm(true), variant: 'destructive' },
		],
		[_id, label, unit, onEditCb]
	);

	return (
		<View>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					<View className="flex-1 gap-1">
						<Text className="text-base font-semibold text-foreground">{label}</Text>
						{unit ? (
							<Text className="text-sm text-muted-foreground">{unit}</Text>
						) : null}
					</View>
				</View>
			</CardView>

			<ConfirmDialog
				open={showConfirm}
				onOpenChange={setShowConfirm}
				description="This will permanently delete this investigation. Types that still have reports cannot be removed."
				destructive
				onConfirm={onDelete}
			/>
		</View>
	);
}
