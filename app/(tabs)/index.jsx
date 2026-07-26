import PageHeader from '@/components/PageHeader';
import { Text, View } from 'react-native';

export default function OverviewScreen() {
	return (
		<View className="flex-1 bg-background">
			<PageHeader text="Overview" />
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-center text-muted-foreground">
					Health dashboard coming in Phase 2
				</Text>
			</View>
		</View>
	);
}
