import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import InvestigationPickerModal from '@/components/InvestigationPickerModal';
import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import HealthGraph from '@/components/widgets/HealthGraph';
import { CARD_LIST_GAP, FAB_STYLE } from '@/constants/layout';
import useHomeWidgets from '@/hooks/useHomeWidgets';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export default function OverviewScreen() {
	const theme = useTheme();
	const investigationsApiManager = useInvestigationsApiManager();
	const { widgetIds, addWidget, removeWidget } = useHomeWidgets();
	const [pickerOpen, setPickerOpen] = useState(false);

	const { data: investigations = [], isLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations();
			return result ?? [];
		},
	});

	const catalogIds = useMemo(
		() => new Set(investigations.map((item) => String(item._id))),
		[investigations]
	);
	const widgets =
		isLoading || catalogIds.size === 0
			? widgetIds
			: widgetIds.filter((id) => catalogIds.has(String(id)));
	const addableInvestigations = useMemo(
		() => investigations.filter((item) => !widgetIds.includes(String(item._id))),
		[investigations, widgetIds]
	);
	const canAdd = !isLoading && addableInvestigations.length > 0;

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: CARD_LIST_GAP, paddingBottom: canAdd ? 96 : 32 }}
				showsVerticalScrollIndicator={false}
			>
				{/* TODO: Hiding for now since its convoluting the focus away from the health metrics */}
				{/* <AppointmentsWidget /> */}
				{/* <AppointmentsWidget type={APPOINTMENT_TYPE.PAST} count={2} /> */}
				{widgets.length > 0 ? (
					widgets.map((id) => (
						<HealthGraph
							key={id}
							investigation={id}
							count={5}
							onRemove={() => removeWidget(id)}
						/>
					))
				) : (
					<Text className="text-center text-muted-foreground">
						{canAdd
							? 'Tap + to add a health graph.'
							: 'No investigations to show yet.'}
					</Text>
				)}
			</ScrollView>

			{canAdd ? (
				<Pressable
					onPress={() => setPickerOpen(true)}
					accessibilityRole="button"
					accessibilityLabel="Add health graph"
					className="absolute bottom-6 right-5 z-10 h-14 w-14 items-center justify-center rounded-full bg-primary active:opacity-80"
					style={FAB_STYLE}
				>
					<Plus size={28} color={theme.colors.primaryForeground} strokeWidth={2.5} />
				</Pressable>
			) : null}

			<InvestigationPickerModal
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				results={addableInvestigations}
				onSelect={addWidget}
			/>
		</View>
	);
}
