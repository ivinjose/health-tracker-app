import useLabelsApiManager from '@/api-managers/LabelsApiManager';
import LabelCard from '@/components/LabelCard';
import CardView from '@/components/CardView';
import NewLabelDialog from '@/components/NewLabelDialog';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { CARD_LIST_GAP, FAB_STYLE } from '@/constants/layout';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

export default function LabelsScreen() {
	const theme = useTheme();
	const [showDialog, setShowDialog] = useState(false);
	const [editingLabel, setEditingLabel] = useState(null);
	const { toast } = useToast();
	const labelsApiManager = useLabelsApiManager();
	const queryClient = useQueryClient();

	const {
		data: labels = [],
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ['labels'],
		queryFn: async () => {
			const result = await labelsApiManager.readLabels();
			return result ?? [];
		},
	});

	const { mutateAsync: removeLabel } = useMutation({
		mutationFn: (id) => labelsApiManager.deleteLabel(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['labels'] });
			toast({ description: 'Your label was deleted successfully!' });
		},
		onError: (error) => {
			toast({ description: error.message });
		},
	});

	const openCreate = () => {
		setEditingLabel(null);
		setShowDialog(true);
	};

	const openEdit = (label) => {
		setEditingLabel(label);
		setShowDialog(true);
	};

	const onDialogOpenChange = (open) => {
		setShowDialog(open);
		if (!open) {
			setEditingLabel(null);
		}
	};

	return (
		<View className="flex-1 bg-background">
			{isLoading ? (
				<LabelsLoading />
			) : isError ? (
				<View className="flex-1 items-center justify-center gap-3 px-6">
					<Text className="text-center text-destructive">Could not load labels.</Text>
					<Button variant="outline" onPress={() => refetch()}>
						<Text>Try again</Text>
					</Button>
				</View>
			) : labels.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-muted-foreground">No labels yet.</Text>
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
					{labels.map((label) => (
						<LabelCard
							key={label._id}
							{...label}
							onEditCb={openEdit}
							onDeleteCb={removeLabel}
						/>
					))}
				</ScrollView>
			)}

			<Pressable
				onPress={openCreate}
				accessibilityRole="button"
				accessibilityLabel="New label"
				className="absolute bottom-6 right-5 z-10 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
				style={FAB_STYLE}
			>
				<Plus size={28} color={theme.colors.primaryForeground} strokeWidth={2.5} />
			</Pressable>

			<NewLabelDialog
				open={showDialog}
				onOpenChange={onDialogOpenChange}
				label={editingLabel}
			/>
		</View>
	);
}

function LabelsLoading() {
	return (
		<View className="p-4">
			<CardView actions={[]}>
				<View className="flex-row gap-4 p-4">
					<Skeleton className="h-10 w-10 rounded-full" />
					<View className="flex-1 gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-24" />
					</View>
				</View>
			</CardView>
		</View>
	);
}
