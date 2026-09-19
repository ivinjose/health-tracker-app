import CardView from '@/components/CardView';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Text } from '@/components/ui/text';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function LabelCard({ _id, name, color, onEditCb, onDeleteCb }) {
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(_id);
		setShowConfirm(false);
	}, [_id, onDeleteCb]);

	const actions = useMemo(
		() => [
			{ label: 'Edit', action: () => onEditCb({ _id, name, color }) },
			{ label: 'Delete', action: () => setShowConfirm(true), variant: 'destructive' },
		],
		[_id, name, color, onEditCb]
	);

	return (
		<View>
			<CardView actions={actions}>
				<View className="flex-row items-center gap-3 p-4">
					<View
						className="h-8 w-8 rounded-full"
						style={{ backgroundColor: color }}
						accessibilityLabel={`${name} color`}
					/>
					<Text className="flex-1 text-base font-semibold text-foreground">{name}</Text>
				</View>
			</CardView>

			<ConfirmDialog
				open={showConfirm}
				onOpenChange={setShowConfirm}
				description="This will permanently delete this label and remove it from all reports."
				destructive
				onConfirm={onDelete}
			/>
		</View>
	);
}
