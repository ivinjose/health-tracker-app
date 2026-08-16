import { useTheme } from '@/components/ThemeProvider';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/useAuth';
import useLogout from '@/hooks/useLogout';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check, User as UserIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export default function UserMenu() {
	const theme = useTheme();
	const logout = useLogout();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { auth } = useAuth();
	const { toast } = useToast();
	const profileApiManager = useProfileApiManager();

	const { data: profiles = [] } = useQuery({
		queryKey: ['profiles'],
		queryFn: () => profileApiManager.readProfiles(),
	});

	const { mutateAsync: switchProfile } = useMutation({
		mutationFn: (profileUserId) => {
			if (profileUserId === auth.id) return;
			return profileApiManager.changeProfile(profileUserId);
		},
		onSuccess: async () => {
			toast({
				description: 'Your profile was switched successfully.',
			});
			await queryClient.invalidateQueries();
			router.replace('/');
		},
	});

	const signout = async () => {
		await logout();
		router.replace('/(auth)/login');
	};

	const gotoProfilesPage = () => {
		router.push('/(tabs)/more/profiles');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Pressable className="flex-row items-center gap-2 rounded-md bg-primary px-3 py-2">
					<UserIcon color={theme.colors.primaryForeground} size={20} />
					<Text className="font-medium text-primary-foreground">{auth.name}</Text>
				</Pressable>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuItem disabled>
						<Text>Profile</Text>
					</DropdownMenuItem>
					<DropdownMenuItem onPress={gotoProfilesPage}>
						<Text>Manage Profiles</Text>
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Text>Switch Profile</Text>
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								{profiles.map((profile) => (
									<DropdownMenuItem
										key={profile._id}
										onPress={() => switchProfile(profile.user)}
									>
										<View className="flex-row items-center justify-between gap-3">
											<View className="flex-row items-center gap-2">
												<UserIcon size={20} color={theme.colors.foreground} />
												<Text>{profile.name}</Text>
											</View>
											{profile.user === auth.id ? (
												<Check size={15} color={theme.colors.tint} />
											) : null}
										</View>
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onPress={signout}>
					<Text>Log out</Text>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
