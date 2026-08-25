import { Text, View } from 'react-native';

export default function WidgetView({ title, children, footer, headerRight }) {
	return (
		<View className="overflow-hidden rounded-lg border border-border bg-card">
			<View className="flex-row items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
				<Text className="min-w-0 flex-1 font-semibold text-foreground">{title}</Text>
				{headerRight}
			</View>
			<View className="px-4 py-3">{children}</View>
			{footer ? <View className="border-t border-border px-4 py-3">{footer}</View> : null}
		</View>
	);
}
