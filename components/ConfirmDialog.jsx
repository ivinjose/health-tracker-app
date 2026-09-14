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

export default function ConfirmDialog({
	open,
	onOpenChange,
	title = 'Are you absolutely sure?',
	description,
	cancelLabel = 'Cancel',
	confirmLabel = 'Continue',
	destructive = false,
	confirmDisabled = false,
	cancelDisabled = false,
	onConfirm,
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description ? (
						<AlertDialogDescription>{description}</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={cancelDisabled}>
						<Text>{cancelLabel}</Text>
					</AlertDialogCancel>
					<AlertDialogAction
						onPress={onConfirm}
						disabled={confirmDisabled}
						className={destructive ? 'bg-destructive' : undefined}
					>
						<Text className={destructive ? 'text-destructive-foreground' : undefined}>
							{confirmLabel}
						</Text>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
