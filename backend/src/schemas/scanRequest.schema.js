import { z } from "zod";

const createScanRequestSchema = z.object({
  scanCentre: z
    .string()
    .min(1, "scanCentre cannot be empty")
    .refine((value) => value.trim().length > 0, {
      message: "scanCentre cannot be empty after trimming whitespace",
    }),
  description: z
    .string()
    .min(1, "description cannot be empty")
    .refine((value) => value.trim().length > 0, {
      message: "description cannot be empty after trimming whitespace",
    }),
  appointment: z
    .string()
    .min(1, "appointment cannot be empty")
    .refine((value) => value.trim().length > 0, {
      message: "appointment cannot be empty after trimming whitespace",
    }),
});

const updateScanRequestSchema = z.object({
  description: z
    .string()
    .min(1, "description cannot be empty")
    .optional()
    .refine((value) => value.trim().length > 0, {
      message: "description cannot be empty after trimming whitespace",
    }),
});

export { createScanRequestSchema, updateScanRequestSchema };
