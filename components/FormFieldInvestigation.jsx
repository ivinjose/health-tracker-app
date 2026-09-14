import InvestigationPickerModal from '@/components/InvestigationPickerModal';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, View } from 'react-native';

export default function FormFieldInvestigation({
	formControl,
	schemaProperty,
	labelText = 'Investigation',
	placeholder = 'Choose from the list',
	investigations = [],
	disabled = false,
}) {
	const [open, setOpen] = useState(false);

	return (
		<Controller
			control={formControl}
			name={schemaProperty}
			render={({ field: { onChange, value }, fieldState: { error } }) => {
				const currentValue = value != null ? String(value) : '';
				const selected = investigations.find(
					(item) => String(item._id) === currentValue,
				);

				return (
					<View className="mb-4">
						{labelText ? (
							<Text className="mb-1 text-sm font-medium text-muted-foreground">
								{labelText}
							</Text>
						) : null}

						<Pressable
							onPress={() => setOpen(true)}
							disabled={disabled}
							className={`flex-row items-center justify-between gap-2 rounded-[10px] border border-input bg-card px-3 py-3 ${disabled ? 'opacity-50' : ''}`}
							accessibilityRole="button"
							accessibilityLabel={labelText}
							accessibilityValue={{ text: selected?.label ?? placeholder }}
							accessibilityState={{ disabled }}
						>
							<Text
								className={
									selected
										? 'min-w-0 flex-1 text-foreground'
										: 'min-w-0 flex-1 text-muted-foreground'
								}
								numberOfLines={1}
							>
								{selected?.label ?? placeholder}
							</Text>
							<Icon
								as={ChevronDown}
								className="shrink-0 text-muted-foreground"
								size={16}
							/>
						</Pressable>

						{error ? (
							<Text className="mt-1 text-sm text-destructive">{error.message}</Text>
						) : null}

						<InvestigationPickerModal
							open={open}
							onOpenChange={setOpen}
							results={investigations}
							currentValue={currentValue}
							onSelect={onChange}
						/>
					</View>
				);
			}}
		/>
	);
}
