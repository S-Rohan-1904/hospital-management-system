import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long.")
  .max(20, "Username must not exceed 20 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores."
  );

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(32, "Password must not exceed 32 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/\d/, "Password must contain at least one digit.")
  .regex(
    /[@$!%*?&]/,
    "Password must contain at least one special character (@, $, !, %, *, ?, &)."
  );

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
