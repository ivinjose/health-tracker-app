import { z } from "zod";

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

const formSchema = z.object({
    investigation: z.string(),
    value: z.string(),
    date: z.date({
        error: "Date is required.",
    }),
    appointment: z.string().optional(),
    remarks: z.string().optional(),
    report: z.any()
        .refine((file) => {
            return file?.size <= MAX_UPLOAD_SIZE
        }, `Max image size is 5MB.`)
        .refine((file) => {
            return ACCEPTED_FILE_TYPES.includes(file.type);
        }, 'Report must be an image, or PDF')
        .optional()
});

export default formSchema;
