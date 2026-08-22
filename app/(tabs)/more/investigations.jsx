import NewInvestigationDialog from '@/components/NewInvestigationDialog';
import InvestigationCard from '@/components/InvestigationCard';
import CardView from '@/components/CardView';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import { CARD_LIST_GAP } from '@/constants/layout';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function InvestigationsScreen() {
	const theme = useTheme();
	const [showDialog, setShowDialog] = useState(false);
	const [editingInvestigation, setEditingInvestigation] = useState(null);
	const { toast } = useToast();
	const investigationsApiManager = useInvestigationsApiManager();
	const queryClient = useQueryClient();

	const {
		data: investigations = [],
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations({});
			return result ?? [];
		},
	});

	const { mutateAsync: removeInvestigation } = useMutation({
		mutationFn: (id) => investigationsApiManager.deleteInvestigation(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['investigations'] });
			toast({ description: 'Your investigation was deleted successfully!' });
		},
		onError: (error) => {
			toast({ description: error.message });
		},
	});

	const openCreate = () => {
		setEditingInvestigation(null);
		setShowDialog(true);
	};

	const openEdit = (investigation) => {
		setEditingInvestigation(investigation);
		setShowDialog(true);
	};

	const onDialogOpenChange = (open) => {
		setShowDialog(open);
		if (!open) {
			setEditingInvestigation(null);
		}
	};

	return (
		<View className="flex-1 bg-background">
			{isLoading ? (
				<InvestigationsLoading />
			) : isError ? (
				<View className="flex-1 items-center justify-center gap-3 px-6">
					<Text className="text-center text-destructive">Could not load investigations.</Text>
					<Button variant="outline" onPress={() => refetch()}>
						<Text>Try again</Text>
					</Button>
				</View>
			) : investigations.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No investigations yet.</Text>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: CARD_LIST_GAP }}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={theme.colors.mutedForeground}
							colors={[theme.colors.tint]}
						/>
					}
				>
					{investigations.map((investigation) => (
						<InvestigationCard
							key={investigation._id}
							{...investigation}
							onEditCb={openEdit}
							onDeleteCb={removeInvestigation}
						/>
					))}
				</ScrollView>
			)}

			<Pressable
				onPress={openCreate}
				accessibilityRole="button"
				accessibilityLabel="New investigation"
				className="absolute bottom-6 right-5 z-10 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 3 },
					shadowOpacity: 0.35,
					shadowRadius: 6,
					elevation: 6,
				}}
			>
				<Plus size={28} color={theme.colors.primaryForeground} strokeWidth={2.5} />
			</Pressable>

			<NewInvestigationDialog
				open={showDialog}
				onOpenChange={onDialogOpenChange}
				investigation={editingInvestigation}
			/>
		</View>
	);
}

function InvestigationsLoading() {
	return (
		<View className="p-4">
			<CardView actions={[]}>
				<View className="flex-row gap-4 p-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<View className="flex-1 gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</View>
				</View>
			</CardView>
		</View>
	);
}
