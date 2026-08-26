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
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
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

				{auth.isAdmin ? <DeleteAccountSection /> : null}
			</View>
		</ScrollView>
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
