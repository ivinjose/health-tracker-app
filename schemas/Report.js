import { z } from "zod";
import {
    ACCEPTED_FILE_TYPES,
    MAX_UPLOAD_SIZE,
    getReportFileSize,
    getReportMimeType,
} from "../lib/reportUpload";

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
            const size = getReportFileSize(file);
            if (size == null) return true;
            return size <= MAX_UPLOAD_SIZE;
        }, 'Max file size is 3MB.')
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_FILE_TYPES.includes(getReportMimeType(file));
        }, 'Report must be an image or PDF')
});

export function isEmptyDraft(row = {}) {
    const investigation = String(row.investigation ?? '').trim();
    const value = String(row.value ?? '').trim();
    return !investigation && !value;
}

export default formSchema;
