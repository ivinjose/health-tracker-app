import InvestigationSelect from '@/components/InvestigationSelect';
import PageHeader from '@/components/PageHeader';
import { Text } from '@/components/ui/text';
import useInvestigationsApiManager from '@/api-managers/InvestigationsApiManager';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

export default function AnalyseReportsScreen() {
	const router = useRouter();
	const investigationsApiManager = useInvestigationsApiManager();

	const { data: investigations = [], isLoading } = useQuery({
		queryKey: ['investigations'],
		queryFn: () => investigationsApiManager.readInvestigations({}),
	});

	const onInvestigationChange = (investigation) => {
		router.push(`/(tabs)/more/analyse-reports/${investigation}`);
	};

	return (
		<View className="flex-1 bg-background">
			<PageHeader text="Analyse Reports" />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-muted-foreground">
					Choose an investigation to view trends and history.
				</Text>
				<InvestigationSelect
					results={isLoading ? [] : investigations}
					onSelectCb={onInvestigationChange}
					currentValue=""
					labelText="Investigation"
				/>
			</ScrollView>
		</View>
	);
}
