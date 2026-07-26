import { z } from "zod";

const formSchema = z.object({
    location: z.string(),
    date: z.date({
        error: "Date is required.",
    }),
    time: z.string(),
    remarks: z.string().optional(),
});

export default formSchema;
