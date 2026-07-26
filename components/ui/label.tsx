import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export function Label({ className, children, ...props }) {
	return (
		<Text className={cn('text-sm font-medium leading-none text-foreground', className)} {...props}>
			{children}
		</Text>
	);
}
