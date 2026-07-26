import PageHeader from '@/components/PageHeader';
import AppointmentsWidget, { APPOINTMENT_TYPE } from '@/components/widgets/AppointmentsWidget';
import HealthGraph from '@/components/widgets/HealthGraph';
import { ScrollView, View } from 'react-native';

export default function OverviewScreen() {
	return (
		<View className="flex-1 bg-background">
			<PageHeader text="Overview" />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				<AppointmentsWidget />
				<AppointmentsWidget type={APPOINTMENT_TYPE.PAST} count={2} />
				<HealthGraph investigation="hba1c" count={5} />
				<HealthGraph investigation="t4" count={5} />
			</ScrollView>
		</View>
	);
}
