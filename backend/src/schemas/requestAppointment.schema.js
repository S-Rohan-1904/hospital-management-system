import { z } from "zod";

export const loginUserSchema = z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string()
    });