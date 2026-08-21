import { z } from "zod";

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

const formSchema = z.object({
    investigation: z.string().min(1, "Investigation is required."),
    value: z.string().min(1, "Report value is required."),
    date: z.date({
        error: "Date is required.",
    }),
    appointment: z
        .string()
        .optional()
        .transform((value) => value || undefined),
    remarks: z.string().optional(),
    report: z
        .any()
        .optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_UPLOAD_SIZE;
        }, `Max image size is 5MB.`)
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_FILE_TYPES.includes(file.type);
        }, 'Report must be an image, or PDF')
});

export default formSchema;
