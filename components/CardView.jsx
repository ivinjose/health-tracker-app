import { EllipsisVertical } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/components/ThemeProvider';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CardView = ({ children, actions = [] }) => {
	const theme = useTheme();

	return (
		<>
			<View className="flex-row items-start justify-between gap-0 overflow-hidden rounded-[10px] bg-card">
				<View className="min-w-0 flex-1">{children}</View>

				{actions.length > 0 && (
					<View className="shrink-0 pt-3 pr-1.5">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Pressable className="-m-1 p-1">
									<EllipsisVertical size={20} color={theme.colors.mutedForeground} />
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
													? 'text-destructive'
													: 'text-popover-foreground'
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
