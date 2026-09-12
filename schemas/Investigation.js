import { z } from "zod";

const formSchema = z.object({
    label: z.string().min(1, "Label is required."),
    unit: z.string().optional(),
});

export default formSchema;
