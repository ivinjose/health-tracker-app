import HealthGraph from '@/components/widgets/HealthGraph';
import { ScrollView, View } from 'react-native';

export default function OverviewScreen() {
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
				<HealthGraph investigation="hba1c" count={5} />
				<HealthGraph investigation="hdl" count={5} />
			</ScrollView>
		</View>
	);
}
