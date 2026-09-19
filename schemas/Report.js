import { z } from "zod";
import {
    isMissingReportFile,
    isPdfOrImage,
    isWithinUploadLimit,
} from "../lib/reportUpload";

export const reportFileSchema = z
    .any()
    .optional()
    .nullable()
    .refine((file) => isMissingReportFile(file) || isWithinUploadLimit(file), 'Max file size is 3MB.')
    .refine((file) => isMissingReportFile(file) || isPdfOrImage(file), 'Report must be a PDF or image');

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
    report: reportFileSchema,
});

export const reportRowSchema = formSchema.pick({
    investigation: true,
    value: true,
});

export function isEmptyDraft(row = {}) {
    const investigation = String(row.investigation ?? '').trim();
    const value = String(row.value ?? '').trim();
    return !investigation && !value;
}

export default formSchema;
