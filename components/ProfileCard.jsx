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
import { CircleUserRound } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

export default function ProfileCard({ user, name, age, gender, parent, onDeleteCb, isAdmin }) {
	const theme = useTheme();
	const [showConfirm, setShowConfirm] = useState(false);

	const onDelete = useCallback(() => {
		onDeleteCb(user);
		setShowConfirm(false);
	}, [user, onDeleteCb]);

	const actions = useMemo(() => {
		if (isAdmin && user !== parent) {
			return [{ label: 'Delete', action: () => setShowConfirm(true) }];
		}
		return [];
	}, [isAdmin, user, parent]);

	return (
		<>
			<CardView actions={actions}>
				<View className="flex-row gap-4 p-4">
					<CircleUserRound size={40} color={theme.colors.primary} />
					<View className="flex-1">
						<Text className="text-base font-semibold text-foreground">{name}</Text>
						<Text className="text-sm text-muted-foreground">
							{gender}, {age} years
						</Text>
						{user === parent ? (
							<Text className="text-sm text-muted-foreground">Admin</Text>
						) : null}
					</View>
				</View>
			</CardView>

			<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete all data associated with this particular profile.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							<Text>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction onPress={onDelete}>
							<Text>Continue</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
