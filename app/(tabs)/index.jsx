import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import HealthGraph from '@/components/widgets/HealthGraph';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

export default function OverviewScreen() {
	return (
		<ThemeProvider appearance="iosDark" className="flex-1 bg-background">
			<OverviewView />
		</ThemeProvider>
	);
}

function OverviewView() {
	const theme = useTheme();
	const isFocused = useIsFocused();

	return (
		<View className="flex-1 bg-background">
			{isFocused ? <StatusBar style={theme.statusBarStyle} /> : null}
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				{/* TODO: Hiding for now since its convoluting the focus away from the health metrics */}
				{/* <AppointmentsWidget /> */}
				{/* <AppointmentsWidget type={APPOINTMENT_TYPE.PAST} count={2} /> */}
				<HealthGraph investigation="hba1c" count={5} />
				<HealthGraph investigation="t4" count={5} />
			</ScrollView>
		</View>
	);
}
