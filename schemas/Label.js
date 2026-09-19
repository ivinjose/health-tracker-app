import { z } from 'zod';
import { isAllowedLabelColor } from '@/constants/labels';

const formSchema = z.object({
	name: z.string().trim().min(1, 'Name is required.'),
	color: z.string().refine((value) => isAllowedLabelColor(value), {
		message: 'Choose a color.',
	}),
});

export default formSchema;
