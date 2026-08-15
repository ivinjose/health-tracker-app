import { EllipsisVertical } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useFormSheetAppearance } from '@/components/form-sheet-appearance';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CardView = ({ children, actions = [] }) => {
	const isDark = useFormSheetAppearance() === 'dark';

	return (
		<>
			<View
				className={
					isDark
						? 'flex-row items-start justify-between gap-0 overflow-hidden rounded-[10px] bg-[#2C2C2E]'
						: 'flex-row items-start justify-between gap-0 overflow-hidden bg-card'
				}
			>
				<View className="min-w-0 flex-1">{children}</View>

				{actions.length > 0 && (
					<View className="shrink-0 pt-0.5">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Pressable className="-m-1 p-1">
									<EllipsisVertical
										size={20}
										color={isDark ? '#8E8E93' : '#565656'}
									/>
								</Pressable>
							</DropdownMenuTrigger>

							<DropdownMenuContent>
								{actions.map((action, index) => (
									<DropdownMenuItem
										key={index}
										onPress={action.action}
										variant={action.variant}
									>
										<Text
											className={
												action.variant === 'destructive'
													? isDark
														? 'text-[#FF453A]'
														: undefined
													: isDark
														? 'text-white'
														: undefined
											}
										>
											{action.label}
										</Text>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</View>
				)}
			</View>
		</>
	);
};

export default CardView;
