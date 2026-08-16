import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
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
	scrollViewRef,
	scrollable = true,
}) {
	const theme = useTheme();

	return (
		<Modal
			visible={open}
			onRequestClose={() => onOpenChange(false)}
			animationType="slide"
			presentationStyle="pageSheet"
			{...(theme.userInterfaceStyle
				? { userInterfaceStyle: theme.userInterfaceStyle }
				: {})}
		>
			<StatusBar style={theme.statusBarStyle} />
			<ThemeProvider appearance={theme.name} className="flex-1 bg-background">
				<FormSheetBody
					title={title}
					footer={footer}
					onConfirm={onConfirm}
					confirmDisabled={confirmDisabled}
					confirmLoading={confirmLoading}
					confirmAccessibilityLabel={confirmAccessibilityLabel}
					onCancel={() => onOpenChange(false)}
					scrollViewRef={scrollViewRef}
					scrollable={scrollable}
				>
					{children}
				</FormSheetBody>
			</ThemeProvider>
		</Modal>
	);
}

function FormSheetBody({
	title,
	children,
	footer,
	onConfirm,
	confirmDisabled,
	confirmLoading,
	confirmAccessibilityLabel,
	onCancel,
	scrollViewRef,
	scrollable,
}) {
	const theme = useTheme();
	const confirmInactive = confirmDisabled || confirmLoading;
	const confirmColor = confirmInactive ? theme.colors.tintDisabled : theme.colors.tint;
	const useToolbar = theme.layout.header === 'toolbar';
	const contentPaddingTop = title
		? theme.layout.contentPaddingTopWithTitle
		: theme.layout.contentPaddingTopWithoutTitle;

	return (
		<>
			{useToolbar ? (
				<View className="flex-row items-center px-4 pb-3 pt-4">
					<Pressable
						onPress={onCancel}
						className="h-8 w-8 items-center justify-center"
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel="Close"
					>
						<CircleX size={28} color={theme.colors.close} />
					</Pressable>
					<View className="min-w-0 flex-1 px-2">
						{title ? (
							<Text
								className="text-center text-[17px] font-semibold text-foreground"
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
								<ActivityIndicator size="small" color={theme.colors.tint} />
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
						<CircleX size={28} color={theme.colors.close} />
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
								<ActivityIndicator size="small" color={theme.colors.tint} />
							) : (
								<CircleCheck size={28} color={confirmColor} />
							)}
						</Pressable>
					) : null}

					{title ? (
						<View className="px-10 pt-14">
							<Text className="text-lg font-semibold text-foreground">{title}</Text>
						</View>
					) : null}
				</>
			)}

			{scrollable ? (
				<ScrollView
					ref={scrollViewRef}
					className="flex-1"
					contentContainerStyle={{
						padding: theme.layout.contentPadding,
						paddingTop: contentPaddingTop,
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
						padding: theme.layout.contentPadding,
						paddingTop: contentPaddingTop,
						paddingBottom: 24,
					}}
				>
					{children}
				</View>
			)}

			{footer ? <View className="px-10 p-4">{footer}</View> : null}
		</>
	);
}
