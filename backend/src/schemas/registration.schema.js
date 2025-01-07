import { z } from "zod";

export const registerUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters long.")
    .max(20, "Full name must not exceed 20 characters"),
  role: z.enum(["doctor", "patient", "scanCentre"]),
  address: z.string().min(10, "Address cannot be empty"),
  gender: z.enum(["male", "female", "other"]),
  specialization: z.string().optional(),
});
