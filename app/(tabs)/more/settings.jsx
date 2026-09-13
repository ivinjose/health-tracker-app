import useBackupApiManager from '@/api-managers/BackupApiManager';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import useUserApiManager from '@/api-managers/UserApiManager';
import { useSetAppearance, useTheme } from '@/components/ThemeProvider';
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
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { CARD_LIST_GAP } from '@/constants/layout';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import useLogout from '@/hooks/useLogout';
import { APPEARANCE_NAMES } from '@/lib/appearance';
import { hasPrimaryAccess } from '@/lib/backup';
import { loadBackupPreviewFromAsset, pickBackupZip, saveBackupToDevice } from '@/lib/backupDevice';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const THEME_LABELS = {
	light: 'Light',
	dark: 'Dark',
};

export default function SettingsScreen() {
	const theme = useTheme();
	const setAppearance = useSetAppearance();
	const { auth } = useAuth();

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-4" style={{ gap: CARD_LIST_GAP }}>
				<Text className="text-sm font-medium text-muted-foreground">Theme</Text>
				<View className="overflow-hidden rounded-lg border border-border bg-card">
					{APPEARANCE_NAMES.map((name, index) => {
						const selected = theme.name === name;
						return (
							<Pressable
								key={name}
								onPress={() => setAppearance(name)}
								className={cn(
									'flex-row items-center justify-between px-4 py-4',
									index > 0 && 'border-t border-border'
								)}
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								accessibilityLabel={THEME_LABELS[name] ?? name}
							>
								<Text className="font-medium text-foreground">
									{THEME_LABELS[name] ?? name}
								</Text>
								{selected ? <Check size={18} color={theme.colors.tint} /> : null}
							</Pressable>
						);
					})}
				</View>

				<BackupRestoreSection />
				{auth.isAdmin ? <DeleteAccountSection /> : null}
			</View>
		</ScrollView>
	);
}

function BackupRestoreSection() {
	const { auth } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const backupApiManager = useBackupApiManager();
	const profileApiManager = useProfileApiManager();
	const [restorePreview, setRestorePreview] = useState(null);
	const [restoreAsset, setRestoreAsset] = useState(null);
	const restoreStarted = useRef(false);

	const { data: profiles = [], isLoading: profilesLoading } = useQuery({
		queryKey: ['profiles'],
		queryFn: () => profileApiManager.readProfiles(),
	});

	const isPrimary = hasPrimaryAccess(profiles, auth.id);

	const { mutate: downloadBackup, isPending: isBackingUp } = useMutation({
		mutationFn: () => backupApiManager.downloadBackup(),
		onSuccess: async ({ data, filename }) => {
			await saveBackupToDevice(data, filename);
			toast({ description: 'Backup saved. Your data on the server was not changed.' });
		},
		onError: (error) => {
			toast({
				description: error.message || 'Could not create a backup.',
			});
		},
	});

	const { mutate: restoreBackup, isPending: isRestoring } = useMutation({
		mutationFn: (asset) => backupApiManager.restoreBackup(asset),
		onSuccess: async () => {
			restoreStarted.current = false;
			setRestorePreview(null);
			setRestoreAsset(null);
			await queryClient.invalidateQueries();
			toast({ description: 'Backup restored. This account now matches that snapshot.' });
		},
		onError: (error) => {
			restoreStarted.current = false;
			toast({
				description: error.message || 'Could not restore this backup.',
			});
		},
	});

	const onRestorePress = async () => {
		try {
			const asset = await pickBackupZip();
			if (!asset) return;
			const preview = await loadBackupPreviewFromAsset(asset);
			setRestoreAsset(asset);
			setRestorePreview(preview);
		} catch (error) {
			toast({
				description: error.message || 'This backup file is not valid.',
			});
		}
	};

	const busy = isBackingUp || isRestoring;
	const actionsDisabled = busy || profilesLoading || !isPrimary;

	return (
		<View style={{ gap: CARD_LIST_GAP }}>
			<Text className="text-sm font-medium text-muted-foreground">Backup</Text>
			<Text className="text-sm text-muted-foreground">
				Download a copy of every profile, lab type, reading, appointment, and attached
				file. Backup does not remove anything from your account.
			</Text>
			{!profilesLoading && !isPrimary ? (
				<Text className="text-sm text-muted-foreground">
					Switch to your primary profile to back up or restore this account.
				</Text>
			) : null}
			<Button
				onPress={() => downloadBackup()}
				disabled={actionsDisabled}
				accessibilityLabel="Download backup"
			>
				<Text className="font-medium text-primary-foreground">
					{isBackingUp ? 'Preparing backup…' : 'Download backup'}
				</Text>
			</Button>
			<Button
				variant="outline"
				onPress={onRestorePress}
				disabled={actionsDisabled}
				accessibilityLabel="Restore backup"
			>
				<Text className="font-medium text-foreground">
					{isRestoring ? 'Restoring…' : 'Restore backup'}
				</Text>
			</Button>

			<AlertDialog
				open={Boolean(restorePreview)}
				onOpenChange={(open) => {
					if (!open && !restoreStarted.current) {
						setRestorePreview(null);
						setRestoreAsset(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Restore this snapshot?</AlertDialogTitle>
						<AlertDialogDescription>
							{restorePreview
								? [
										`This backup was created on ${restorePreview.milestoneLabel}.`,
										restorePreview.countsLabel
											? `It includes ${restorePreview.countsLabel}.`
											: '',
										'Restoring will replace the current health data on this account with that snapshot. Anything saved after that time, or that is not in this backup, will be gone. Your login stays the same.',
									]
										.filter(Boolean)
										.join(' ')
								: ''}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRestoring}>
							<Text>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isRestoring || !restoreAsset}
							className="bg-destructive"
							onPress={() => {
								restoreStarted.current = true;
								restoreBackup(restoreAsset);
							}}
						>
							<Text className="text-destructive-foreground">
								{isRestoring ? 'Restoring…' : 'Replace with this backup'}
							</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</View>
	);
}

function DeleteAccountSection() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const logout = useLogout();
	const { toast } = useToast();
	const userApiManager = useUserApiManager();
	const [showFirstConfirm, setShowFirstConfirm] = useState(false);
	const [showSecondConfirm, setShowSecondConfirm] = useState(false);

	const { mutate: deleteAccount, isPending } = useMutation({
		mutationFn: () => userApiManager.deleteAccount(),
		onSuccess: async () => {
			queryClient.clear();
			await logout();
			router.replace('/(auth)/login');
		},
		onError: (error) => {
			toast({
				description: error.message || 'Could not delete account.',
			});
		},
	});

	return (
		<View style={{ gap: CARD_LIST_GAP }}>
			<Text className="text-sm font-medium text-muted-foreground">Account</Text>
			<Text className="text-sm text-muted-foreground">
				Deleting your account permanently removes your login, every profile, and all
				health data. This cannot be undone.
			</Text>
			<Button
				variant="destructive"
				onPress={() => setShowFirstConfirm(true)}
				disabled={isPending}
				accessibilityLabel="Delete account"
			>
				<Text className="font-medium text-white">Delete account</Text>
			</Button>

			<AlertDialog open={showFirstConfirm} onOpenChange={setShowFirstConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your account
							and all health data, including every profile.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							<Text>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isPending}
							className="bg-destructive"
							onPress={() => {
								setShowFirstConfirm(false);
								setShowSecondConfirm(true);
							}}
						>
							<Text className="text-destructive-foreground">Continue</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={showSecondConfirm} onOpenChange={setShowSecondConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>This cannot be reversed</AlertDialogTitle>
						<AlertDialogDescription>
							This is a one-time, non-reversible action. Your login, every profile,
							reports, and appointments will be permanently removed, and you will be
							signed out.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							<Text>Cancel</Text>
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isPending}
							className="bg-destructive"
							onPress={() => deleteAccount()}
						>
							<Text className="text-destructive-foreground">
								{isPending ? 'Deleting…' : 'Delete permanently'}
							</Text>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</View>
	);
}
