import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { useToast } from '@/hooks/use-toast';
import {
	MAX_UPLOAD_SIZE,
	REPORT_PICKER_TYPES,
	getReportFileLabel,
	isExistingReportFile,
	normalizePickedFile,
} from '@/lib/reportUpload';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Paperclip } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { ActionSheetIOS, Alert, Platform, Pressable, View } from 'react-native';

const MAX_UPLOAD_MB = MAX_UPLOAD_SIZE / (1024 * 1024);
const PLACEHOLDER = 'Choose PDF or photo';
const PICKER_DELAY_MS = 300;

function runAfterSheet(fn) {
	setTimeout(fn, PICKER_DELAY_MS);
}

function chooseSource({ onPhoto, onFiles }) {
	if (Platform.OS === 'web') {
		onFiles();
		return;
	}

	if (Platform.OS === 'ios') {
		ActionSheetIOS.showActionSheetWithOptions(
			{
				options: ['Photo library', 'Files', 'Cancel'],
				cancelButtonIndex: 2,
			},
			(buttonIndex) => {
				if (buttonIndex === 0) runAfterSheet(onPhoto);
				if (buttonIndex === 1) runAfterSheet(onFiles);
			}
		);
		return;
	}

	Alert.alert('Attach report', undefined, [
		{ text: 'Photo library', onPress: () => runAfterSheet(onPhoto) },
		{ text: 'Files', onPress: () => runAfterSheet(onFiles) },
		{ text: 'Cancel', style: 'cancel' },
	]);
}

export default function FormFieldFile({
	formControl,
	schemaProperty,
	labelText,
	disabled = false,
}) {
	const theme = useTheme();
	const { toast } = useToast();

	const applyPicked = (onChange, asset, options) => {
		const file = normalizePickedFile(asset, options);
		if (!file) return;
		onChange(file);
	};

	const pickDocument = async (onChange) => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: REPORT_PICKER_TYPES,
				copyToCacheDirectory: true,
				multiple: false,
			});
			if (result.canceled) return;
			applyPicked(onChange, result.assets?.[0]);
		} catch (error) {
			toast({ description: error.message || 'Could not attach report.' });
		}
	};

	const pickPhoto = async (onChange) => {
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				toast({
					description: 'Photo library access is needed to attach a report photo.',
				});
				return;
			}
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.9,
				allowsMultipleSelection: false,
			});
			if (result.canceled) return;
			applyPicked(onChange, result.assets?.[0], { kind: 'image' });
		} catch (error) {
			toast({ description: error.message || 'Could not attach report.' });
		}
	};

	const onChooseFile = (onChange) => {
		chooseSource({
			onPhoto: () => pickPhoto(onChange),
			onFiles: () => pickDocument(onChange),
		});
	};

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const fileName = getReportFileLabel(value);
				const attachedLabel = isExistingReportFile(value)
					? 'Attached report'
					: fileName
						? `Attached ${fileName}`
						: PLACEHOLDER;

				return (
					<View className="mb-4">
						{labelText ? (
							<Text className="mb-1 text-sm font-medium text-muted-foreground">
								{labelText}
							</Text>
						) : null}

						<View className="flex-row items-center gap-2">
							<Pressable
								onPress={() => onChooseFile(onChange)}
								disabled={disabled}
								className={`min-w-0 flex-1 flex-row items-center gap-2 rounded-[10px] border border-input bg-card px-3 py-3 ${disabled ? 'opacity-50' : ''}`}
								accessibilityRole="button"
								accessibilityLabel={attachedLabel}
								accessibilityState={{ disabled }}
							>
								<Paperclip size={20} color={theme.colors.tint} />
								<Text
									className={
										fileName
											? 'min-w-0 flex-1 text-foreground'
											: 'text-muted-foreground'
									}
									numberOfLines={1}
								>
									{fileName || PLACEHOLDER}
								</Text>
							</Pressable>
							{fileName ? (
								<Pressable
									onPress={() => onChange(undefined)}
									disabled={disabled}
									hitSlop={8}
									accessibilityRole="button"
									accessibilityLabel="Remove attached report"
									accessibilityState={{ disabled }}
								>
									<Text
										className={
											disabled
												? 'text-sm text-muted-foreground'
												: 'text-sm text-destructive'
										}
									>
										Remove
									</Text>
								</Pressable>
							) : null}
						</View>

						<Text className="mt-1 text-xs text-muted-foreground">
							Optional · PDF or image · max {MAX_UPLOAD_MB}MB
						</Text>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}
					</View>
				);
			}}
		/>
	);
}
