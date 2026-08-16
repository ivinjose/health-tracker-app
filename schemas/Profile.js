import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name is required."),
    age: z.string().min(1, "Age is required."),
    gender: z.string().min(1, "Gender is required."),
});

export default formSchema;