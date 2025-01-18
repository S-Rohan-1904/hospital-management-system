import { z } from "zod";

const updatePasswordSchema = z.object({
  oldPassword: z.string().refine((value) => value.trim().length > 0, {
    message: "oldPassword cannot be empty after trimming whitespace",
  }),
  newPassword: z.string().refine((value) => value.trim().length > 0, {
    message: "newPassword cannot be empty after trimming whitespace",
  }),
});

const updateUserDetailsSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "fullName cannot be empty after trimming whitespace",
    }),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "email cannot be empty after trimming whitespace",
    }),
  gender: z
    .enum(["male", "female", "other"])
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "gender cannot be empty after trimming whitespace",
    }),
  address: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "address cannot be empty after trimming whitespace",
    }),
  specialization: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length > 0, {
      message: "specialization cannot be empty after trimming whitespace",
    }),
});

export { updatePasswordSchema, updateUserDetailsSchema };
