import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Keyboard,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	View,
} from 'react-native';

const CLOSE_ICON_SIZE = 36;

function useKeyboardHeight(enabled) {
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (!enabled || Platform.OS === 'web') {
			setHeight(0);
			return undefined;
		}

		const show = Keyboard.addListener(
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
			(event) => setHeight(event.endCoordinates.height)
		);
		const hide = Keyboard.addListener(
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
			() => setHeight(0)
		);

		return () => {
			show.remove();
			hide.remove();
		};
	}, [enabled]);

	return height;
}

function CloseControl({ onCancel, color, className }) {
	return (
		<Pressable
			onPress={onCancel}
			className={className}
			hitSlop={8}
			style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
			accessibilityRole="button"
			accessibilityLabel="Close"
		>
			<SymbolView
				name="xmark.circle.fill"
				size={CLOSE_ICON_SIZE}
				tintColor={color}
				type="hierarchical"
				fallback={
					<IconSymbol
						name="xmark.circle.fill"
						size={CLOSE_ICON_SIZE}
						color={color}
					/>
				}
			/>
		</Pressable>
	);
}

function DeleteControl({
	onDelete,
	color,
	className,
	disabled = false,
	accessibilityLabel = 'Remove',
}) {
	return (
		<Pressable
			onPress={onDelete}
			disabled={disabled}
			className={className}
			hitSlop={8}
			style={({ pressed }) => (pressed || disabled ? { opacity: 0.6 } : undefined)}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ disabled }}
		>
			<Trash2 size={18} color={color} />
		</Pressable>
	);
}

function ConfirmControl({
	onConfirm,
	confirmInactive,
	confirmLoading,
	confirmColor,
	confirmAccessibilityLabel,
	tintColor,
	className,
}) {
	return (
		<Pressable
			onPress={onConfirm}
			disabled={confirmInactive}
			className={className}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel={confirmAccessibilityLabel}
			accessibilityState={{
				disabled: confirmInactive,
				busy: confirmLoading,
			}}
		>
			{confirmLoading ? (
				<ActivityIndicator size="small" color={tintColor} />
			) : (
				<Text
					className="text-[17px] font-semibold"
					style={{ color: confirmColor }}
				>
					Save
				</Text>
			)}
		</Pressable>
	);
}

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
	onDelete,
	deleteDisabled = false,
	deleteAccessibilityLabel = 'Remove',
	scrollViewRef,
	scrollable = true,
	padded = true,
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
					open={open}
					title={title}
					footer={footer}
					onConfirm={onConfirm}
					confirmDisabled={confirmDisabled}
					confirmLoading={confirmLoading}
					confirmAccessibilityLabel={confirmAccessibilityLabel}
					onDelete={onDelete}
					deleteDisabled={deleteDisabled}
					deleteAccessibilityLabel={deleteAccessibilityLabel}
					onCancel={() => onOpenChange(false)}
					scrollViewRef={scrollViewRef}
					scrollable={scrollable}
					padded={padded}
				>
					{children}
				</FormSheetBody>
			</ThemeProvider>
		</Modal>
	);
}

function FormSheetBody({
	open,
	title,
	children,
	footer,
	onConfirm,
	confirmDisabled,
	confirmLoading,
	confirmAccessibilityLabel,
	onDelete,
	deleteDisabled,
	deleteAccessibilityLabel,
	onCancel,
	scrollViewRef,
	scrollable,
	padded,
}) {
	const theme = useTheme();
	const keyboardHeight = useKeyboardHeight(open);
	const confirmInactive = confirmDisabled || confirmLoading;
	const confirmColor = confirmInactive ? theme.colors.tintDisabled : theme.colors.tint;
	const useToolbar = theme.layout.header === 'toolbar';
	const contentPaddingTop = title
		? theme.layout.contentPaddingTopWithTitle
		: theme.layout.contentPaddingTopWithoutTitle;
	const contentStyle = padded
		? {
			padding: theme.layout.contentPadding,
			paddingTop: contentPaddingTop,
			paddingBottom: 24,
		}
		: undefined;
	const scrollContentStyle = padded
		? {
			...contentStyle,
			paddingBottom: 24 + keyboardHeight,
			flexGrow: 0,
		}
		: { paddingBottom: keyboardHeight, flexGrow: 0 };

	return (
		<>
			{useToolbar ? (
				<View className="flex-row items-center px-4 pb-3 pt-4">
					<View className="min-w-[48px] flex-1 items-start">
						<CloseControl
							onCancel={onCancel}
							color={theme.colors.close}
							className="h-8 w-8 items-center justify-center"
						/>
					</View>
					<View className="min-w-0 max-w-[55%] px-2">
						{title ? (
							<Text
								className="text-center text-[17px] font-semibold text-foreground"
								numberOfLines={1}
							>
								{title}
							</Text>
						) : null}
					</View>
					<View className="min-w-[48px] flex-1 items-end">
						{onConfirm ? (
							<ConfirmControl
								onConfirm={onConfirm}
								confirmInactive={confirmInactive}
								confirmLoading={confirmLoading}
								confirmColor={confirmColor}
								confirmAccessibilityLabel={confirmAccessibilityLabel}
								tintColor={theme.colors.tint}
								className="h-8 items-center justify-center"
							/>
						) : onDelete ? (
							<DeleteControl
								onDelete={onDelete}
								disabled={deleteDisabled}
								accessibilityLabel={deleteAccessibilityLabel}
								color={theme.colors.destructive}
								className="h-8 w-8 items-center justify-center"
							/>
						) : (
							<View className="h-8 w-8" />
						)}
					</View>
				</View>
			) : (
				<>
					<CloseControl
						onCancel={onCancel}
						color={theme.colors.close}
						className="absolute left-4 top-4 z-10 h-8 w-8 items-center justify-center"
					/>

					{onConfirm ? (
						<ConfirmControl
							onConfirm={onConfirm}
							confirmInactive={confirmInactive}
							confirmLoading={confirmLoading}
							confirmColor={confirmColor}
							confirmAccessibilityLabel={confirmAccessibilityLabel}
							tintColor={theme.colors.tint}
							className="absolute right-4 top-4 z-10 h-8 items-center justify-center"
						/>
					) : onDelete ? (
						<DeleteControl
							onDelete={onDelete}
							disabled={deleteDisabled}
							accessibilityLabel={deleteAccessibilityLabel}
							color={theme.colors.destructive}
							className="absolute right-4 top-4 z-10 h-8 w-8 items-center justify-center"
						/>
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
					contentContainerStyle={scrollContentStyle}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
				>
					{children}
				</ScrollView>
			) : (
				<View className="flex-1" style={contentStyle}>
					{children}
				</View>
			)}

			{footer ? <View className="px-10 p-4">{footer}</View> : null}
		</>
	);
}
