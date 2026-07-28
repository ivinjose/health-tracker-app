import { Text } from '@/components/ui/text';
import { CircleX } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';

export default function FormSheetModal({
	open,
	onOpenChange,
	title,
	children,
	footer,
	scrollViewRef,
	scrollable = true,
}) {
	const onCancel = () => onOpenChange(false);

	return (
		<Modal
			visible={open}
			onRequestClose={onCancel}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<View className="flex-1 bg-background">
				<Pressable
					onPress={onCancel}
					className="absolute left-4 top-4 z-10"
					hitSlop={8}
				>
					<CircleX size={28} color="#4c4c4c" />
				</Pressable>

				{title ? (
					<View className="px-10 pt-14">
						<Text className="text-lg font-semibold text-foreground">{title}</Text>
					</View>
				) : null}

				{scrollable ? (
					<ScrollView
						ref={scrollViewRef}
						className="flex-1"
						contentContainerStyle={{
							padding: 40,
							paddingTop: title ? 16 : 56,
							paddingBottom: 24,
						}}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{children}
					</ScrollView>
				) : (
					<View
						className="flex-1"
						style={{
							padding: 40,
							paddingTop: title ? 16 : 56,
							paddingBottom: 24,
						}}
					>
						{children}
					</View>
				)}

				{footer ? <View className="px-10 p-4">{footer}</View> : null}
			</View>
		</Modal>
	);
}
