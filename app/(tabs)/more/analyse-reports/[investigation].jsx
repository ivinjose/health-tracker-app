import { StubScreen } from '@/components/PageHeader';
import { useLocalSearchParams } from 'expo-router';

export default function AnalyseInvestigationScreen() {
	const { investigation } = useLocalSearchParams();
	const title = investigation
		? `Analyse: ${Array.isArray(investigation) ? investigation[0] : investigation}`
		: 'Analyse Reports';

	return <StubScreen title={title} phase="Phase 3" />;
}
