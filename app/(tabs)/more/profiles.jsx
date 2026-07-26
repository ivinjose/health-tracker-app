import NewProfileDialog from '@/components/NewProfileDialog';
import PageHeader from '@/components/PageHeader';
import ProfileCard from '@/components/ProfileCard';
import CardView from '@/components/CardView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import useAuth from '@/hooks/useAuth';
import useProfileApiManager from '@/api-managers/ProfileApiManager';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function ProfilesScreen() {
	const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
	const { auth } = useAuth();
	const { toast } = useToast();
	const profileApiManager = useProfileApiManager();
	const queryClient = useQueryClient();

	const { data: profiles = [], isLoading } = useQuery({
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
			<PageHeader text="Manage user profiles" />
			<View className="px-4 py-3">
				<Button onPress={() => setShowNewProfileDialog(true)}>
					<Plus size={18} color="#fff" />
					<Text className="ml-2 font-medium text-primary-foreground">Create new profile</Text>
				</Button>
			</View>

			{isLoading ? (
				<ProfilesLoading />
			) : profiles.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No profiles yet.</Text>
				</View>
			) : (
				<ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 16 }}>
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
