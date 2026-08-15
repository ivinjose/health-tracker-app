import {
	FormSheetAppearanceContext,
	IOS_DARK_SHEET,
} from '@/components/form-sheet-appearance';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { CircleCheck, CircleX } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native';

export default function FormSheetModal({
	open,
	onOpenChange,
	title,
	children,
	footer,
	onConfirm,
	confirmDisabled = false,
	confirmLoading = false,
	confirmAccessibilityLabel = 'Save',
	appearance = 'light',
	scrollViewRef,
	scrollable = true,
}) {
	const onCancel = () => onOpenChange(false);
	const confirmInactive = confirmDisabled || confirmLoading;
	const isDark = appearance === 'dark';
	const closeColor = isDark ? IOS_DARK_SHEET.close : '#4c4c4c';
	const confirmColor = confirmInactive
		? isDark
			? IOS_DARK_SHEET.tintDisabled
			: '#9ca3af'
		: isDark
			? IOS_DARK_SHEET.tint
			: '#007AFF';

	return (
		<Modal
			visible={open}
			onRequestClose={onCancel}
			animationType="slide"
			presentationStyle="pageSheet"
			{...(isDark ? { userInterfaceStyle: 'dark' } : {})}
		>
			{isDark ? <StatusBar style="light" /> : null}
			<FormSheetAppearanceContext.Provider value={appearance}>
				<View className={isDark ? 'flex-1 bg-[#1C1C1E]' : 'flex-1 bg-background'}>
					{isDark ? (
						<View className="flex-row items-center px-4 pb-3 pt-4">
							<Pressable
								onPress={onCancel}
								className="h-8 w-8 items-center justify-center"
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Close"
							>
								<CircleX size={28} color={closeColor} />
							</Pressable>
							<View className="min-w-0 flex-1 px-2">
								{title ? (
									<Text
										className="text-center text-[17px] font-semibold text-white"
										numberOfLines={1}
									>
										{title}
									</Text>
								) : null}
							</View>
							{onConfirm ? (
								<Pressable
									onPress={onConfirm}
									disabled={confirmInactive}
									className="h-8 w-8 items-center justify-center"
									hitSlop={8}
									accessibilityRole="button"
									accessibilityLabel={confirmAccessibilityLabel}
									accessibilityState={{
										disabled: confirmInactive,
										busy: confirmLoading,
									}}
								>
									{confirmLoading ? (
										<ActivityIndicator size="small" color={IOS_DARK_SHEET.tint} />
									) : (
										<CircleCheck size={28} color={confirmColor} />
									)}
								</Pressable>
							) : (
								<View className="h-8 w-8" />
							)}
						</View>
					) : (
						<>
							<Pressable
								onPress={onCancel}
								className="absolute left-4 top-4 z-10"
								hitSlop={8}
								accessibilityRole="button"
								accessibilityLabel="Close"
							>
								<CircleX size={28} color={closeColor} />
							</Pressable>

							{onConfirm ? (
								<Pressable
									onPress={onConfirm}
									disabled={confirmInactive}
									className="absolute right-4 top-4 z-10"
									hitSlop={8}
									accessibilityRole="button"
									accessibilityLabel={confirmAccessibilityLabel}
									accessibilityState={{
										disabled: confirmInactive,
										busy: confirmLoading,
									}}
								>
									{confirmLoading ? (
										<ActivityIndicator size="small" color="#007AFF" />
									) : (
										<CircleCheck size={28} color={confirmColor} />
									)}
								</Pressable>
							) : null}

							{title ? (
								<View className="px-10 pt-14">
									<Text className="text-lg font-semibold text-foreground">
										{title}
									</Text>
								</View>
							) : null}
						</>
					)}

					{scrollable ? (
						<ScrollView
							ref={scrollViewRef}
							className="flex-1"
							contentContainerStyle={{
								padding: isDark ? 20 : 40,
								paddingTop: isDark ? 8 : title ? 16 : 56,
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
								padding: isDark ? 20 : 40,
								paddingTop: isDark ? 8 : title ? 16 : 56,
								paddingBottom: 24,
							}}
						>
							{children}
						</View>
					)}

					{footer ? <View className="px-10 p-4">{footer}</View> : null}
				</View>
			</FormSheetAppearanceContext.Provider>
		</Modal>
	);
}
