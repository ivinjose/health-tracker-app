import NewProfileDialog from '@/components/NewProfileDialog';
import ProfileCard from '@/components/ProfileCard';
import CardView from '@/components/CardView';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import useAuth from '@/hooks/useAuth';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

export default function ProfilesScreen() {
	const theme = useTheme();
	const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
	const { auth } = useAuth();
	const { toast } = useToast();
	const profileApiManager = useProfileApiManager();
	const queryClient = useQueryClient();

	const {
		data: profiles = [],
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['profiles'],
		queryFn: () => profileApiManager.readProfiles(),
	});

	const { mutateAsync: removeProfile } = useMutation({
		mutationFn: (data) => profileApiManager.deleteProfile(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['profiles'] });
			toast({ description: 'Your profile was deleted successfully!' });
		},
	});

	return (
		<View className="flex-1 bg-background">
			<View className="px-4 py-3">
				<Button onPress={() => setShowNewProfileDialog(true)}>
					<Plus size={18} color={theme.colors.primaryForeground} />
					<Text className="ml-2 font-medium text-primary-foreground">Create new profile</Text>
				</Button>
			</View>

			{isLoading ? (
				<ProfilesLoading />
			) : isError ? (
				<View className="flex-1 items-center justify-center gap-3 px-6">
					<Text className="text-center text-destructive">Could not load profiles.</Text>
					<Button variant="outline" onPress={() => refetch()}>
						<Text>Try again</Text>
					</Button>
				</View>
			) : profiles.length === 0 ? (
				<View className="flex-1 items-center justify-center gap-4 px-6">
					<Text className="text-center text-muted-foreground">No profiles yet.</Text>
					<Button onPress={() => setShowNewProfileDialog(true)}>
						<Text className="font-medium text-primary-foreground">Create profile</Text>
					</Button>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, gap: 16 }}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={theme.colors.mutedForeground}
							colors={[theme.colors.tint]}
						/>
					}
				>
					{profiles.map(({ _id, ...rest }) => (
						<ProfileCard
							key={_id}
							{...rest}
							onDeleteCb={removeProfile}
							isAdmin={auth.isAdmin}
						/>
					))}
				</ScrollView>
			)}

			<NewProfileDialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog} />
		</View>
	);
}

function ProfilesLoading() {
	return (
		<View className="p-4">
			<CardView actions={[]}>
				<View className="flex-row gap-4 p-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<View className="flex-1 gap-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-16" />
					</View>
				</View>
			</CardView>
		</View>
	);
}
