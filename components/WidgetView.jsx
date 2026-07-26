import { Text, View } from 'react-native';

export default function WidgetView({ title, children, footer }) {
	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card">
			<View className="border-b border-border bg-muted/30 px-4 py-3">
				<Text className="font-semibold text-foreground">{title}</Text>
			</View>
			<View className="px-4 py-3">{children}</View>
			{footer ? <View className="border-t border-border px-4 py-3">{footer}</View> : null}
		</View>
	);
}
