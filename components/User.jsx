import { useTheme } from '@/components/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { CARD_LIST_GAP } from '@/constants/layout';
import { cn } from '@/lib/utils';
import { setPrivateAccessToken } from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import { storeRefreshToken } from '@/hooks/useRefreshToken';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check, CircleUserRound } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export default function UserMenu() {
	const theme = useTheme();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { auth, setAuth } = useAuth();
	const { toast } = useToast();
	const profileApiManager = useProfileApiManager();

	const {
		data: profiles = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['profiles'],
		queryFn: () => profileApiManager.readProfiles(),
	});

	const { mutateAsync: switchProfile, isPending } = useMutation({
		mutationFn: (profileUserId) => profileApiManager.changeProfile(profileUserId),
		onSuccess: async (data) => {
			const { accessToken, isAdmin, name, id, refreshToken } = data ?? {};
			// Switch issues a new JWT whose `profile` claim is the target user.
			// Navigating home without applying that token keeps the old JWT, so
			// Overview still loads the previous profile's data.
			if (!accessToken || !id) {
				toast({ description: 'Could not switch profile.' });
				return;
			}

			setPrivateAccessToken(accessToken);
			setAuth({ accessToken, isAdmin, name, id });
			// Server rotates the refresh token on switch. Native has no cookie,
			// so persist it here or later /api/refresh will still send the old one.
			await storeRefreshToken(refreshToken);
			toast({
				description: 'Your profile was switched successfully.',
			});
			await queryClient.invalidateQueries();
			router.replace('/');
		},
		onError: () => {
			toast({ description: 'Could not switch profile.' });
		},
	});

	const onSelectProfile = (profileUserId) => {
		if (String(profileUserId) === String(auth.id) || isPending) return;
		switchProfile(profileUserId);
	};

	return (
		<View style={{ gap: CARD_LIST_GAP }}>
			<Text className="text-sm font-medium text-muted-foreground">Profile</Text>
			<View className="overflow-hidden rounded-lg border border-border bg-card">
				{isLoading ? (
					<ProfileListLoading />
				) : isError ? (
					<View className="px-4 py-4">
						<Text className="text-destructive">Could not load profiles.</Text>
					</View>
				) : (
					profiles.map((profile, index) => {
						const selected = String(profile.user) === String(auth.id);
						return (
							<Pressable
								key={profile._id}
								onPress={() => onSelectProfile(profile.user)}
								className={cn(
									'flex-row items-center justify-between px-4 py-4',
									index > 0 && 'border-t border-border'
								)}
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								accessibilityLabel={profile.name}
							>
								<View className="min-w-0 flex-1 flex-row items-center gap-3">
									<CircleUserRound size={22} color={theme.colors.primary} />
									<Text className="font-medium text-foreground" numberOfLines={1}>
										{profile.name}
									</Text>
								</View>
								{selected ? <Check size={18} color={theme.colors.tint} /> : null}
							</Pressable>
						);
					})
				)}
			</View>
		</View>
	);
}

function ProfileListLoading() {
	return (
		<View className="gap-3 px-4 py-4">
			<Skeleton className="h-5 w-32" />
			<Skeleton className="h-5 w-28" />
		</View>
	);
}
