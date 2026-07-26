import { Text, View } from 'react-native';

import { cn } from '@/lib/utils';

export default function PageHeader({ text }) {
	return (
		<View className="border-b border-border px-4 py-3">
			<Text className="text-xl font-semibold text-foreground">{text}</Text>
		</View>
	);
}

export function StubScreen({ title, phase = 'Phase 2/3' }) {
	return (
		<View className="flex-1 bg-background">
			<PageHeader text={title} />
			<View className="flex-1 items-center justify-center px-6">
				<Text className="text-center text-muted-foreground">Coming in {phase}</Text>
			</View>
		</View>
	);
}
