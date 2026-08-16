import { z } from "zod";

const formSchema = z.object({
    location: z.string().min(1, "Location is required."),
    date: z.date({
        error: "Date is required.",
    }),
    time: z.string().min(1, "Time is required."),
    remarks: z.string().optional(),
});

export default formSchema;
