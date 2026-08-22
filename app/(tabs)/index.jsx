import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import HealthGraph from '@/components/widgets/HealthGraph';
import { Text } from '@/components/ui/text';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, View } from 'react-native';

const HOME_WIDGET_SLUGS = ['hba1c', 'hdl'];

export default function OverviewScreen() {
	const investigationsApiManager = useInvestigationsApiManager();
	const { data: investigations = [], isLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: async () => {
			const result = await investigationsApiManager.readInvestigations({});
			return result ?? [];
		},
	});

	const catalogValues = new Set(investigations.map((item) => item.value));
	const widgets = isLoading
		? HOME_WIDGET_SLUGS
		: HOME_WIDGET_SLUGS.filter((slug) => catalogValues.has(slug));

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				{/* TODO: Hiding for now since its convoluting the focus away from the health metrics */}
				{/* <AppointmentsWidget /> */}
				{/* <AppointmentsWidget type={APPOINTMENT_TYPE.PAST} count={2} /> */}
				{widgets.length > 0 ? (
					widgets.map((slug) => (
						<HealthGraph key={slug} investigation={slug} count={5} />
					))
				) : (
					<Text className="text-center text-muted-foreground">
						No investigations to show yet.
					</Text>
				)}
			</ScrollView>
		</View>
	);
}
